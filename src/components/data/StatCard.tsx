import { formatCompact, formatStatUsd } from '../../lib/format';
import { RollingNumber } from './RollingNumber';
import { Skeleton } from '../primitives/Skeleton';

export interface StatItem {
  label: string;
  value: number | null;
  kind: 'usd' | 'count' | 'token';
}

export function StatStrip({
  items,
  loading,
}: {
  items: StatItem[];
  loading?: boolean;
}) {
  return (
    <div className="stat-strip" aria-busy={loading || undefined}>
      {(loading ? Array.from({ length: 6 }, (_, index) => ({ label: 'Loading', value: null, kind: 'usd' as const, index })) : items.map((item, index) => ({ ...item, index }))).map(
        (item) => (
          <div className="stat-cell" key={item.index}>
            {loading ? (
              <>
                <Skeleton width={72} height={12} />
                <Skeleton width={96} height={24} />
              </>
            ) : (
              <>
                <p className="eyebrow">{item.label}</p>
                <p className="data-md">
                  <RollingNumber
                    value={item.value}
                    format={item.kind === 'usd' ? formatStatUsd : (value) => formatCompact(value)}
                  />
                </p>
              </>
            )}
          </div>
        ),
      )}
    </div>
  );
}
