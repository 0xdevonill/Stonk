import { useState } from 'react';
import type { TokenomicsSlice, DistributionSegment } from '../../lib/api';
import { formatPct } from '../../lib/format';
import { Donut } from '../data/Donut';

export function TokenomicsChart({
  slices,
}: {
  slices: Array<TokenomicsSlice | DistributionSegment>;
}) {
  const [active, setActive] = useState<string | null>(slices[0]?.id ?? null);
  const current = slices.find((slice) => slice.id === active) ?? slices[0];
  return (
    <div className="tokenomics">
      <Donut
        segments={slices.map((slice) => ({ id: slice.id, label: slice.label, sharePct: slice.sharePct }))}
        activeId={active}
        onActive={(id) => setActive(id ?? slices[0]?.id ?? null)}
      />
      <ul className="tokenomics-list">
        {slices.map((slice) => {
          const detail = 'detail' in slice ? slice.detail : undefined;
          return (
            <li key={slice.id}>
              <button
                type="button"
                className={slice.id === current?.id ? 'tokenomics-row is-active' : 'tokenomics-row'}
                onClick={() => setActive(slice.id)}
                onMouseEnter={() => setActive(slice.id)}
                onFocus={() => setActive(slice.id)}
              >
                <span>{slice.label}</span>
                <span className="num">{formatPct(slice.sharePct, false)}</span>
              </button>
              {slice.id === current?.id && detail ? <p className="caption muted tokenomics-detail">{detail}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
