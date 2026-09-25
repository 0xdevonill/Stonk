import { useState } from 'react';
import { ArrowsOut, Pulse } from '@phosphor-icons/react';
import { useMarket } from '../context/MarketContext';
import { useQuery } from '../hooks/useQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePanelProps } from '../hooks/usePanelProps';
import { useIsMobile } from '../hooks/useMediaQuery';
import {
  CHART_TIMEFRAMES,
  fetchActivity,
  fetchChart,
  fetchHolders,
  type ChartTimeframe,
} from '../lib/api';
import { useAsset } from '../context/MarketContext';
import { formatAddress, formatCompact, formatPct, formatPrice } from '../lib/format';
import { cn } from '../lib/cn';
import { Change } from '../components/data/Change';
import { ChartFrame } from '../components/data/Chart';
import { RollingNumber } from '../components/data/RollingNumber';
import { DataTable } from '../components/data/DataTable';
import { Button } from '../components/primitives/Button';
import { DataBoundary, EmptyState } from '../components/primitives/StateBlock';
import { TimeframePills } from '../components/primitives/TimeframePills';
import { TradingPanel } from '../components/trade/TradingPanel';
import { ActivityFeed } from '../components/composite/ActivityFeed';
import { BottomSheet } from '../components/overlays/BottomSheet';
import { contracts } from '../lib/contracts/config';

export function TradePage() {
  usePageTitle('Trade');
  const market = useMarket();
  const asset = useAsset();
  const panel = usePanelProps();
  const mobile = useIsMobile();
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1D');
  const [mode, setMode] = useState<'candle' | 'line'>('candle');
  const [tab, setTab] = useState<'holders' | 'activity' | 'info'>('holders');
  const [expanded, setExpanded] = useState(false);
  const [sheet, setSheet] = useState(false);
  const chart = useQuery(`trade-chart-${timeframe}`, () => fetchChart(timeframe));
  const holders = useQuery('trade-holders', fetchHolders);
  const activity = useQuery('trade-activity', fetchActivity);
  const stats = market.stats;
  const candles = chart.data?.candles ?? [];
  const last = candles[candles.length - 1];
  const low = candles.reduce((min, candle) => Math.min(min, candle.low), Number.POSITIVE_INFINITY);
  const high = candles.reduce((max, candle) => Math.max(max, candle.high), Number.NEGATIVE_INFINITY);
  const summary = `${asset.displaySymbol} ${mode} chart. Pool price ${stats ? formatPrice(stats.priceUsd) : 'unavailable'}. 24 hour change ${formatPct(stats?.change24hPct ?? null)}. Range ${Number.isFinite(low) ? formatPrice(low) : '--'} to ${Number.isFinite(high) ? formatPrice(high) : '--'}.`;

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

  const chartBlock = (
    <DataBoundary loading={chart.loading} error={chart.error} onRetry={chart.reload} skeleton={<div className="chart-frame trade skeleton" />}>
      <ChartFrame className={cn('trade', expanded && 'expanded')} candles={candles} mode={mode} summary={summary} />
    </DataBoundary>
  );

  return (
    <div className={cn('trade-layout', 'has-sticky-action')}>
      <section className="trade-main">
        <header className="pair-head card">
          <div>
            <p className="eyebrow">{asset.displaySymbol} / USD</p>
            <div className="price-main">
              <p className="data-lg">
                <RollingNumber value={stats?.priceUsd ?? null} flash />
              </p>
              <Change value={stats?.change24hPct ?? null} />
            </div>
          </div>
          <p className="caption faint">
            Pool price · {asset.quoteSymbol ? `${asset.symbol}/${asset.quoteSymbol}` : contracts.chainName}
          </p>
        </header>

        <div className="card chart-card">
          <div className="between chart-toolbar">
            <TimeframePills options={CHART_TIMEFRAMES} value={timeframe} onChange={setTimeframe} label="Chart timeframe" />
            <div className="cluster">
              <div className="seg" role="tablist" aria-label="Chart type">
                <button type="button" className={cn('seg-btn', mode === 'candle' && 'is-active')} onClick={() => setMode('candle')}>
                  Candles
                </button>
                <button type="button" className={cn('seg-btn', mode === 'line' && 'is-active')} onClick={() => setMode('line')}>
                  Line
                </button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setExpanded(true)} aria-label="Expand chart">
                <ArrowsOut size={20} aria-hidden="true" /> Expand
              </Button>
            </div>
          </div>
          {chartBlock}
        </div>

        <div className="card">
          <div className="seg" role="tablist" aria-label="Market detail">
            {(['holders', 'activity', 'info'] as const).map((item) => (
              <button key={item} type="button" className={cn('seg-btn', tab === item && 'is-active')} onClick={() => setTab(item)}>
                {item === 'holders' ? 'Holders' : item === 'activity' ? 'Activity' : 'Info'}
              </button>
            ))}
          </div>
          {tab === 'holders' ? (
            <DataBoundary
              loading={holders.loading}
              error={holders.error}
              empty={(holders.data?.holders.length ?? 0) === 0}
              onRetry={holders.reload}
              skeleton={<div className="skeleton-block" />}
              emptyState={<EmptyState icon={Pulse} message="This contract does not publish a holder index." />}
            >
              <DataTable
                caption="Top holders"
                rows={(holders.data?.holders ?? []).slice(0, 8)}
                rowKey={(row) => row.address}
                columns={[
                  { key: 'rank', header: 'Rank', render: (row) => row.rank },
                  { key: 'address', header: 'Address', render: (row) => formatAddress(row.address) },
                  { key: 'balance', header: 'Balance', align: 'right', render: (row) => formatCompact(row.balance) },
                  { key: 'share', header: 'Share', align: 'right', render: (row) => formatPct(row.sharePct, false) },
                ]}
              />
            </DataBoundary>
          ) : null}
          {tab === 'activity' ? (
            <DataBoundary
              loading={activity.loading}
              error={activity.error}
              onRetry={activity.reload}
              empty={(activity.data?.items.length ?? 0) === 0}
              skeleton={<div className="skeleton-block" />}
              emptyState={<EmptyState icon={Pulse} message="No prints yet. The tape is quiet." />}
            >
              <ActivityFeed items={activity.data?.items ?? []} now={Date.now()} />
            </DataBoundary>
          ) : null}
          {tab === 'info' ? (
            <dl className="quote-rows">
              <div>
                <dt>Contract</dt>
                <dd className="num">{formatAddress(contracts.tokenAddress)}</dd>
              </div>
              <div>
                <dt>Staking</dt>
                <dd className="num">{formatAddress(contracts.stakingAddress)}</dd>
              </div>
              <div>
                <dt>Router</dt>
                <dd className="num">{formatAddress(contracts.routerAddress)}</dd>
              </div>
              <div>
                <dt>Last candle close</dt>
                <dd className="num">{last ? formatPrice(last.close) : '--'}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      {mobile ? (
        <>
          <button type="button" className="sticky-action btn btn-primary btn-lg" onClick={() => setSheet(true)}>
            Trade {asset.displaySymbol}
          </button>
          <BottomSheet open={sheet} title="Trade" onClose={() => setSheet(false)}>
            <TradingPanel {...panelProps} />
          </BottomSheet>
        </>
      ) : (
        <aside className="trade-rail">
          <TradingPanel {...panelProps} />
        </aside>
      )}

      {expanded ? (
        <div className="overlay">
          <div className="modal raised chart-modal">
            <div className="between">
              <h2 className="heading-sm">Full chart</h2>
              <Button variant="secondary" size="sm" onClick={() => setExpanded(false)}>
                Close
              </Button>
            </div>
            <ChartFrame className="expanded" candles={candles} mode={mode} summary={summary} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
