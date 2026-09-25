import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from '@phosphor-icons/react';
import { useMarket } from '../context/MarketContext';
import { useWallet } from '../context/WalletContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { PORTFOLIO_RANGES, type PortfolioRange } from '../lib/api';
import { formatPct, formatToken, formatUsd, formatRelative, formatAddress } from '../lib/format';
import { cn } from '../lib/cn';
import { Button } from '../components/primitives/Button';
import { DataBoundary, EmptyState } from '../components/primitives/StateBlock';
import { Change } from '../components/data/Change';
import { ChartFrame } from '../components/data/Chart';
import { TimeframePills } from '../components/primitives/TimeframePills';
import { DataTable } from '../components/data/DataTable';
import { ActivityFeed } from '../components/composite/ActivityFeed';
import type { Candle } from '../lib/api';

export function PortfolioPage() {
  usePageTitle('Portfolio');
  const wallet = useWallet();
  const market = useMarket();
  const [range, setRange] = useState<PortfolioRange>('1M');
  const [tab, setTab] = useState<'holdings' | 'staked' | 'tokenized' | 'history'>('holdings');
  const account = wallet.account;
  const price = market.stats?.priceUsd ?? null;
  const eth = market.stats?.ethPriceUsd ?? null;

  const totals = useMemo(() => {
    if (!account || price == null || eth == null) return { total: null as number | null, pnl: null as number | null };
    const stonk = account.balances.STONK * price;
    const ether = account.balances.ETH * eth;
    const staked = account.staked * price;
    const total = stonk + ether + staked;
    const change = market.stats?.change24hPct ?? 0;
    const pnl = stonk * (change / 100);
    return { total, pnl };
  }, [account, price, eth, market.stats?.change24hPct]);

  const candles: Candle[] = useMemo(() => {
    const series = account?.performance[range] ?? [];
    if (!series.length || totals.total == null) return [];
    const last = series[series.length - 1]?.value || 1;
    const scale = totals.total / last;
    return series.map((point, index) => {
      const value = point.value * scale;
      const prev = index === 0 ? value : series[index - 1].value * scale;
      return {
        time: point.time,
        open: prev,
        close: value,
        high: Math.max(prev, value),
        low: Math.min(prev, value),
        volume: 0,
      };
    });
  }, [account, range, totals.total]);

  if (!account && !wallet.accountLoading) {
    return (
      <div className="page-wrap">
        <header className="page-intro">
          <p className="eyebrow">Portfolio</p>
          <h1 className="heading-lg">Your book</h1>
        </header>
        <EmptyState
          icon={Wallet}
          message="Connect to see your portfolio."
          action={<Button onClick={wallet.openConnect}>Connect wallet</Button>}
        />
      </div>
    );
  }

  const pnlPct = totals.total && totals.pnl != null && totals.total !== 0 ? (totals.pnl / (totals.total - totals.pnl)) * 100 : null;

  return (
    <div className="page-wrap">
      <header className="page-intro">
        <p className="eyebrow">Portfolio</p>
        <h1 className="heading-lg">Your book</h1>
      </header>
      <DataBoundary
        loading={wallet.accountLoading && !account}
        error={wallet.accountError}
        onRetry={() => {
          void wallet.reloadAccount();
        }}
        skeleton={<div className="card skeleton-block" />}
      >
        <div className="card summary-bar">
          <div>
            <p className="eyebrow">Total value</p>
            <p className="data-lg num">{formatUsd(totals.total)}</p>
          </div>
          <div>
            <p className="eyebrow">24h P/L</p>
            <p className="data-md num">{formatUsd(totals.pnl)}</p>
            <Change value={pnlPct} />
          </div>
          <p className="caption faint num">{account ? formatAddress(account.address) : '--'}</p>
        </div>
        <div className="card chart-card">
          <TimeframePills options={PORTFOLIO_RANGES} value={range} onChange={setRange} label="Performance range" />
          <ChartFrame
            candles={candles}
            mode="line"
            summary={`Portfolio illustrative value ${formatUsd(totals.total)}, 24 hour change ${formatPct(pnlPct)}.`}
          />
        </div>
        <div className="seg" role="tablist" aria-label="Portfolio sections">
          {(
            [
              ['holdings', 'Holdings'],
              ['staked', 'Staked'],
              ['tokenized', 'Tokenized assets'],
              ['history', 'Transaction history'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={cn('seg-btn', tab === id && 'is-active')} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'holdings' && account ? (
          <DataTable
            caption="Holdings"
            rows={[
              { id: 'STONK', name: 'Stonk', amount: account.balances.STONK, value: price == null ? null : account.balances.STONK * price, change: market.stats?.change24hPct ?? null },
              { id: 'ETH', name: 'Ether', amount: account.balances.ETH, value: eth == null ? null : account.balances.ETH * eth, change: market.stats?.ethChange24hPct ?? null },
            ]}
            rowKey={(row) => row.id}
            columns={[
              { key: 'name', header: 'Asset', render: (row) => row.name },
              { key: 'amount', header: 'Amount', align: 'right', render: (row) => formatToken(row.amount) },
              { key: 'value', header: 'Value', align: 'right', render: (row) => formatUsd(row.value) },
              { key: 'change', header: '24h', align: 'right', render: (row) => formatPct(row.change) },
            ]}
          />
        ) : null}
        {tab === 'staked' && account ? (
          account.staked > 0 ? (
            <DataTable
              caption="Staked position"
              rows={[{ id: 'sSTONK', amount: account.staked, rewards: account.pendingRewards, value: price == null ? null : account.staked * price }]}
              rowKey={(row) => row.id}
              columns={[
                { key: 'id', header: 'Position', render: (row) => row.id },
                { key: 'amount', header: 'Staked', align: 'right', render: (row) => formatToken(row.amount) },
                { key: 'rewards', header: 'Pending', align: 'right', render: (row) => formatToken(row.rewards) },
                { key: 'value', header: 'Value', align: 'right', render: (row) => formatUsd(row.value) },
              ]}
            />
          ) : (
            <EmptyState
              icon={Wallet}
              message="You haven't staked yet."
              action={
                <Link to="/stake" className="btn btn-primary btn-md">
                  Stake $STONK
                </Link>
              }
            />
          )
        ) : null}
        {tab === 'tokenized' && account ? (
          <DataTable
            caption="Tokenized assets"
            rows={account.tokenized}
            rowKey={(row) => row.id}
            columns={[
              { key: 'name', header: 'Asset', render: (row) => row.name },
              { key: 'ticker', header: 'Ticker', render: (row) => row.ticker },
              { key: 'amount', header: 'Amount', align: 'right', render: (row) => formatToken(row.amount) },
              { key: 'value', header: 'Value', align: 'right', render: (row) => formatUsd(row.valueUsd) },
            ]}
          />
        ) : null}
        {tab === 'history' && account ? (
          <div className="card">
            <ActivityFeed items={account.history} now={Date.now()} />
            <p className="caption faint">Latest print {account.history[0] ? formatRelative(account.history[0].time) : '--'}.</p>
          </div>
        ) : null}
      </DataBoundary>
    </div>
  );
}
