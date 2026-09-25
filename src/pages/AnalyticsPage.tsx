import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp } from '@phosphor-icons/react';
import { useQuery } from '../hooks/useQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { fetchActivity, fetchChart, fetchHolders } from '../lib/api';
import { formatAddress, formatCompact, formatPct, formatUsd } from '../lib/format';
import { cn } from '../lib/cn';
import { DataBoundary } from '../components/primitives/StateBlock';
import { DataTable } from '../components/data/DataTable';
import { ChartFrame } from '../components/data/Chart';
import { TokenomicsChart } from '../components/composite/TokenomicsChart';
import { Icon } from '../components/primitives/Icon';

const limits = [10, 25, 50, 100] as const;

export function AnalyticsPage() {
  usePageTitle('Analytics');
  const holders = useQuery('analytics-holders', fetchHolders);
  const activity = useQuery('analytics-activity', fetchActivity);
  const volume = useQuery('analytics-volume', () => fetchChart('1M'));
  const [limit, setLimit] = useState<(typeof limits)[number]>(10);
  const rows = useMemo(() => (holders.data?.holders ?? []).slice(0, limit), [holders.data, limit]);

  return (
    <div className="page-wrap">
      <header className="page-intro">
        <p className="eyebrow">Analytics</p>
        <h1 className="heading-lg">Holders</h1>
        <p className="body-md muted">Holder and print indexes appear only when this contract publishes them.</p>
      </header>
      <div className="grid-2 grid-2-lg">
        <DataBoundary loading={holders.loading} error={holders.error} onRetry={holders.reload} skeleton={<div className="card skeleton-block" />}>
          <article className="card">
            <h2 className="heading-sm">Distribution</h2>
            <TokenomicsChart slices={holders.data?.segments ?? []} />
          </article>
        </DataBoundary>
        <DataBoundary loading={activity.loading} error={activity.error} onRetry={activity.reload} skeleton={<div className="card skeleton-block" />}>
          <article className="card">
            <h2 className="heading-sm">Buy / sell</h2>
            <div
              className="ratio"
              role="img"
              aria-label={`Buy ${formatPct(activity.data?.buyPct ?? null, false)}, sell ${formatPct(activity.data?.sellPct ?? null, false)}`}
            >
              <span className="ratio-buy" style={{ width: `${activity.data?.buyPct ?? 0}%` }} />
              <span className="ratio-sell" style={{ width: `${activity.data?.sellPct ?? 0}%` }} />
            </div>
            <div className="between">
              <span className="change change-up">
                <Icon icon={ArrowUp} size={20} /> Buy {formatPct(activity.data?.buyPct ?? null, false)}
              </span>
              <span className="change change-down">
                <Icon icon={ArrowDown} size={20} /> Sell {formatPct(activity.data?.sellPct ?? null, false)}
              </span>
            </div>
            <p className="caption faint">Counted from prints this contract exposes. An empty bar means none were published.</p>
          </article>
        </DataBoundary>
      </div>
      <section className="stack">
        <div className="between">
          <h2 className="heading-md">Top holders</h2>
          <div className="preset-row" role="tablist" aria-label="Holder count">
            {limits.map((item) => (
              <button key={item} type="button" className={cn('pill', limit === item && 'is-active')} onClick={() => setLimit(item)}>
                Top {item}
              </button>
            ))}
          </div>
        </div>
        <DataBoundary loading={holders.loading} error={holders.error} onRetry={holders.reload} skeleton={<div className="card skeleton-block" />}>
          <DataTable
            caption="Top holders"
            rows={rows}
            rowKey={(row) => row.address}
            columns={[
              { key: 'rank', header: 'Rank', render: (row) => row.rank },
              { key: 'address', header: 'Address', render: (row) => formatAddress(row.address) },
              { key: 'balance', header: 'Balance', align: 'right', render: (row) => formatCompact(row.balance) },
              { key: 'share', header: 'Share', align: 'right', render: (row) => formatPct(row.sharePct, false) },
              { key: 'value', header: 'Value', align: 'right', render: (row) => formatUsd(row.valueUsd) },
            ]}
          />
        </DataBoundary>
      </section>
      <section className="stack">
        <h2 className="heading-md">Transaction volume</h2>
        <DataBoundary loading={volume.loading} error={volume.error} onRetry={volume.reload} skeleton={<div className="chart-frame skeleton" />}>
          <div className="card">
            <ChartFrame
              candles={volume.data?.candles ?? []}
              mode="candle"
              summary="Illustrative monthly volume shown as candle volume bars."
            />
          </div>
        </DataBoundary>
      </section>
    </div>
  );
}
