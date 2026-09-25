import { formatRelative, formatToken, formatUsd } from '../../lib/format';
import type { ActivityItem, ActivityKind } from '../../lib/api';
import { cn } from '../../lib/cn';

const labels: Record<ActivityKind, string> = {
  buy: 'Buy',
  sell: 'Sell',
  stake: 'Stake',
  unstake: 'Unstake',
  transfer: 'Transfer',
  claim: 'Claim',
};

export function ActivityFeed({ items, now }: { items: ActivityItem[]; now: number }) {
  return (
    <ol className="feed">
      {items.map((item) => (
        <li key={item.id} className="feed-row">
          <span className={cn('feed-kind', `feed-${item.kind}`)}>{labels[item.kind]}</span>
          <span className="num faint">{`${item.address.slice(0, 6)}…${item.address.slice(-4)}`}</span>
          <span className="num">{formatToken(item.amount, 2)} STONK</span>
          <span className="num faint">{formatUsd(item.valueUsd)}</span>
          <time className="caption faint" dateTime={new Date(item.time).toISOString()}>
            {formatRelative(item.time, now)}
          </time>
        </li>
      ))}
    </ol>
  );
}
