import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowsOut, Pulse, Wallet } from '@phosphor-icons/react';
import { useMarket } from '../context/MarketContext';
import { useWallet } from '../context/WalletContext';
import { useQuery } from '../hooks/useQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePanelProps } from '../hooks/usePanelProps';
import {
  CHART_TIMEFRAMES,
  fetchActivity,
  fetchChart,
  fetchHolders,
  fetchStaking,
  fetchTokenomics,
  type ChartTimeframe,
} from '../lib/api';
import { contracts } from '../lib/contracts/config';
import { useAsset } from '../context/MarketContext';
import { formatAddress, formatCompact, formatPrice, formatToken } from '../lib/format';
import { Container } from '../components/layout/Container';
import { SectionHead } from '../components/layout/SectionHead';
import { PriceCard } from '../components/data/PriceCard';
import { StatStrip } from '../components/data/StatCard';
import { ChartFrame } from '../components/data/Chart';
import { Button } from '../components/primitives/Button';
import { CopyButton } from '../components/primitives/CopyButton';
import { Skeleton } from '../components/primitives/Skeleton';
import { DataBoundary, EmptyState } from '../components/primitives/StateBlock';
import { TimeframePills } from '../components/primitives/TimeframePills';
import { SwapPanel } from '../components/trade/SwapPanel';
import { TradingPanel } from '../components/trade/TradingPanel';
import { ActivityFeed } from '../components/composite/ActivityFeed';
import { EarnCard } from '../components/composite/EarnCard';
import { CommissionCard } from '../components/composite/CommissionCard';
import { TokenomicsChart } from '../components/composite/TokenomicsChart';
import { FaqList, homeFaq } from '../components/composite/FaqList';
import { DataTable } from '../components/data/DataTable';
import { formatPct } from '../lib/format';
import { fetchEarn } from '../lib/api';

const features = [
  {
    title: 'Precision execution',
    body: 'Slippage, impact, and minimum received sit in the open, on the same panel you confirm.',
  },
  {
    title: 'Robinhood network',
    body: 'Eligible tokenized assets are meant to settle beside the book, with the same confirmation states.',
  },
  {
    title: 'Positions you can audit',
    body: 'Holdings, stakes, and history stay labeled. If a figure cannot load, the terminal says so.',
  },
];

export function HomePage() {
  usePageTitle('Home');
  const market = useMarket();
  const asset = useAsset();
  const wallet = useWallet();
  const panel = usePanelProps();
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1D');
  const chart = useQuery(`home-chart-${timeframe}`, () => fetchChart(timeframe));
  const holders = useQuery('home-holders', fetchHolders);
  const staking = useQuery('home-staking', fetchStaking);
  const earn = useQuery('home-earn', fetchEarn);
  const tokenomics = useQuery('home-tokenomics', fetchTokenomics);
  const activityQuery = useQuery('home-activity', fetchActivity);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = market.stats;
  const summary = stats
    ? `${asset.displaySymbol} pool price ${formatPrice(stats.priceUsd)}, 24 hour change ${formatPct(stats.change24hPct)}.`
    : 'Price chart loading.';

  const panelProps = {
    baseSymbol: panel.baseSymbol,
    quoteSymbol: panel.quoteSymbol,
    balances: panel.balances,
    connected: panel.connected,
    networkOk: panel.networkOk,
    onConnect: panel.onConnect,
    onSwitchNetwork: panel.onSwitchNetwork,
    onSubmit: panel.onSubmit,
  };

  return (
    <Container className="home-stack">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Terminal</p>
          <h1 className="display-xl">The trading terminal for the internet&apos;s favorite asset class.</h1>
          <p className="hero-sub body-lg muted">
            A desk for {asset.displaySymbol}. Price, swaps, and trades are read from its contract. The numbers stay still
            until the pool moves.
          </p>
          <div className="hero-actions">
            {wallet.account ? (
              <Link to="/trade" className="btn btn-primary btn-lg">
                Trade
              </Link>
            ) : (
              <Button size="lg" onClick={wallet.openConnect}>
                Connect wallet
              </Button>
            )}
            <Link to="/trade" className="btn btn-secondary btn-lg">
              {wallet.account ? 'Open terminal' : 'Trade'}
            </Link>
            <Link to="/swap" className="btn btn-secondary btn-lg">
              Swap
            </Link>
          </div>
          <div className="address-chip">
            <span className="caption faint">Token</span>
            <span className="num">{formatAddress(contracts.tokenAddress)}</span>
            <CopyButton value={contracts.tokenAddress} label="Copy token address" />
          </div>
        </div>
        <DataBoundary
          loading={market.loading}
          error={market.error}
          onRetry={market.reload}
          skeleton={<PriceCard loading price={null} changePct={null} sparkline={[]} />}
        >
          <PriceCard
            price={stats?.priceUsd ?? null}
            changePct={stats?.change24hPct ?? null}
            sparkline={stats?.sparkline ?? []}
          />
        </DataBoundary>
      </section>

      {market.error ? null : (
        <StatStrip
          loading={market.loading}
          items={[
            { label: 'Market cap', value: stats?.marketCapUsd ?? null, kind: 'usd' },
            { label: 'Liquidity', value: stats?.liquidityUsd ?? null, kind: 'usd' },
            { label: '24h volume', value: stats?.volume24hUsd ?? null, kind: 'usd' },
            { label: 'Holders', value: stats?.holders ?? null, kind: 'count' },
            { label: 'Transactions', value: stats?.transactions24h ?? null, kind: 'count' },
            { label: 'Staked', value: stats?.stakedAmount ?? null, kind: 'token' },
          ]}
        />
      )}

      <section>
        <SectionHead
          eyebrow="Price"
          title="The tape"
          action={
            <Link to="/trade" className="btn btn-secondary btn-md">
              <ArrowsOut size={20} aria-hidden="true" /> Open full terminal
            </Link>
          }
        />
        <div className="card chart-card">
          <div className="between chart-toolbar">
            <TimeframePills options={CHART_TIMEFRAMES} value={timeframe} onChange={setTimeframe} label="Chart timeframe" />
          </div>
          <DataBoundary
            loading={chart.loading}
            error={chart.error}
            onRetry={chart.reload}
            skeleton={<div className="chart-frame skeleton" />}
          >
            <ChartFrame candles={chart.data?.candles ?? []} mode="candle" summary={summary} />
          </DataBoundary>
        </div>
      </section>

      <section>
        <SectionHead eyebrow="Orders" title={`Move ${asset.displaySymbol}`} />
        <div className="grid-2 grid-2-lg">
          <SwapPanel {...panelProps} />
          <TradingPanel {...panelProps} variant="buy-only" />
        </div>
      </section>

      <section>
        <SectionHead
          eyebrow="Staking"
          title="Estimated yield"
          action={
            <Link to="/stake" className="btn btn-primary btn-md">
              Stake now
            </Link>
          }
        />
        <DataBoundary
          loading={staking.loading}
          error={staking.error}
          onRetry={staking.reload}
          skeleton={<div className="card skeleton-block" />}
        >
          <article className="card stake-highlight">
            <div>
              <p className="eyebrow">Estimated APR</p>
              <p className="data-lg num">{formatPct(staking.data?.aprPct ?? null, false)}</p>
              <p className="body-md muted">This contract does not publish a staking APR.</p>
            </div>
            <div>
              <p className="eyebrow">Protocol staked</p>
              <p className="data-md num">{formatCompact(staking.data?.totalStaked ?? null)}</p>
              <p className="caption faint">Stake reads stay empty until a staking contract for {asset.symbol || 'this token'} is configured.</p>
            </div>
          </article>
        </DataBoundary>
      </section>

      <section>
        <SectionHead eyebrow="Earn" title="Markets" action={<Link to="/earn" className="text-link">View all</Link>} />
        <DataBoundary
          loading={earn.loading}
          error={earn.error}
          empty={(earn.data?.assets.length ?? 0) === 0}
          onRetry={earn.reload}
          emptyState={<EmptyState icon={Wallet} message="This token does not publish an earn market." />}
          skeleton={
            <div className="h-scroll">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} width={280} height={180} radius={16} />
              ))}
            </div>
          }
        >
          <div className="h-scroll">
            {(earn.data?.assets ?? []).map((asset) => (
              <EarnCard
                key={asset.id}
                asset={asset}
                holding={
                  wallet.account
                    ? asset.ticker === 'STONK'
                      ? wallet.account.balances.STONK
                      : asset.ticker === 'sSTONK'
                        ? wallet.account.staked
                        : 0
                    : null
                }
              />
            ))}
          </div>
        </DataBoundary>
      </section>

      <section>
        <SectionHead eyebrow="Portfolio" title="Your book" />
        {wallet.account ? (
          <article className="card portfolio-teaser">
            <div>
              <p className="eyebrow">Wallet</p>
              <p className="data-md num">{formatToken(wallet.account.balances.STONK)} {asset.symbol || 'Token'}</p>
              <p className="caption muted num">{formatToken(wallet.account.balances.ETH)} {asset.quoteSymbol || 'Quote'}</p>
            </div>
            <Link to="/portfolio" className="btn btn-secondary btn-md">
              Open portfolio
            </Link>
          </article>
        ) : (
          <EmptyState
            icon={Wallet}
            message="Connect to see your portfolio."
            action={
              <Button onClick={wallet.openConnect} size="md">
                Connect wallet
              </Button>
            }
          />
        )}
      </section>

      <section>
        <SectionHead
          eyebrow="Activity"
          title="Prints"
          action={
            <span className="live-pill">
              <span className="live-dot" aria-hidden="true" /> LIVE
            </span>
          }
        />
        <DataBoundary
          loading={activityQuery.loading}
          error={activityQuery.error}
          empty={(activityQuery.data?.items.length ?? 0) === 0}
          onRetry={activityQuery.reload}
          skeleton={<div className="card skeleton-block" />}
          emptyState={<EmptyState icon={Pulse} message="No prints yet. The tape is quiet." />}
        >
          <div className="card">
            <ActivityFeed items={activityQuery.data?.items ?? []} now={now} />
          </div>
        </DataBoundary>
      </section>

      <section>
        <SectionHead eyebrow="Holders" title="Distribution" action={<Link to="/analytics" className="text-link">Full analytics</Link>} />
        <DataBoundary
          loading={holders.loading}
          error={holders.error}
          empty={(holders.data?.holders.length ?? 0) === 0}
          onRetry={holders.reload}
          emptyState={<EmptyState icon={Pulse} message="This contract does not publish a holder index." />}
          skeleton={<div className="card skeleton-block" />}
        >
          <div className="card holder-preview">
            <TokenomicsChart slices={holders.data?.segments ?? []} />
            <DataTable
              caption="Top holders"
              rows={(holders.data?.holders ?? []).slice(0, 5)}
              rowKey={(row) => row.address}
              columns={[
                { key: 'rank', header: 'Rank', render: (row) => row.rank },
                { key: 'address', header: 'Address', render: (row) => formatAddress(row.address) },
                { key: 'share', header: 'Share', align: 'right', render: (row) => formatPct(row.sharePct, false) },
                {
                  key: 'balance',
                  header: 'Balance',
                  align: 'right',
                  render: (row) => formatCompact(row.balance),
                },
              ]}
            />
          </div>
        </DataBoundary>
      </section>

      <section className="grid-2 grid-2-lg">
        <div>
          <SectionHead eyebrow="Tokenomics" title="Supply" />
          <DataBoundary
            loading={tokenomics.loading}
            error={tokenomics.error}
            empty={(tokenomics.data?.tokenomics.slices.length ?? 0) === 0}
            onRetry={tokenomics.reload}
            emptyState={<EmptyState icon={Pulse} message="This contract publishes total supply, not an allocation split." />}
            skeleton={<div className="card skeleton-block" />}
          >
            <div className="card">
              <TokenomicsChart slices={tokenomics.data?.tokenomics.slices ?? []} />
            </div>
          </DataBoundary>
        </div>
        <div>
          <SectionHead eyebrow="Commission" title="Accrual" />
          <DataBoundary
            loading={tokenomics.loading}
            error={tokenomics.error}
            onRetry={tokenomics.reload}
            skeleton={<div className="card skeleton-block" />}
          >
            <CommissionCard
              amount={tokenomics.data?.commission.accruedUsd ?? null}
              label={tokenomics.data?.commission.epochLabel ?? 'Current epoch'}
            />
          </DataBoundary>
        </div>
      </section>

      <section>
        <SectionHead eyebrow="Utility" title="What the desk is for" />
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="card feature-card">
              <h3 className="heading-sm">{feature.title}</h3>
              <p className="body-md muted">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq">
        <SectionHead eyebrow="Questions" title="Straight answers" />
        <FaqList items={homeFaq} />
      </section>

    </Container>
  );
}
