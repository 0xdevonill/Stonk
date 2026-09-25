import { useId } from 'react';
import { formatPct } from '../../lib/format';

export interface DonutSegment {
  id: string;
  label: string;
  sharePct: number;
  detail?: string;
}

export function Donut({
  segments,
  activeId,
  onActive,
}: {
  segments: DonutSegment[];
  activeId: string | null;
  onActive: (id: string | null) => void;
}) {
  const titleId = useId();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.sharePct, 0) || 1;
  let offset = 0;
  const active = segments.find((segment) => segment.id === activeId) ?? segments[0];

  return (
    <div className="donut">
      <svg viewBox="0 0 120 120" role="img" aria-labelledby={titleId}>
        <title id={titleId}>
          {active ? `${active.label} ${formatPct(active.sharePct, false)}` : 'Allocation chart'}
        </title>
        <circle className="donut-track" cx="60" cy="60" r={radius} />
        {segments.map((segment, index) => {
          const length = (segment.sharePct / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const node = (
            <circle
              key={segment.id}
              className={cnSegment(index, segment.id === active?.id)}
              cx="60"
              cy="60"
              r={radius}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              onMouseEnter={() => onActive(segment.id)}
              onMouseLeave={() => onActive(null)}
            />
          );
          offset += length;
          return node;
        })}
      </svg>
      <div className="donut-center">
        <p className="data-md num">{active ? formatPct(active.sharePct, false) : 'XX%'}</p>
        <p className="caption faint">{active?.label ?? 'Allocation'}</p>
      </div>
    </div>
  );
}

function cnSegment(index: number, active: boolean): string {
  return `donut-seg donut-seg-${index % 6}${active ? ' is-active' : ''}`;
}
