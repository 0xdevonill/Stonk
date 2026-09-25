import { Badge } from '../primitives/Badge';
import { Skeleton } from '../primitives/Skeleton';
import { Change } from './Change';
import { RollingNumber } from './RollingNumber';
import { Sparkline } from './Sparkline';
import { useAsset } from '../../context/MarketContext';

export function PriceCard({
  price,
  changePct,
  sparkline,
  loading,
}: {
  price: number | null;
  changePct: number | null;
  sparkline: number[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <article className="price-card" aria-busy="true">
        <span className="sr-only">Reading the tape…</span>
        <div className="between">
          <Skeleton width={88} height={16} />
          <Skeleton width={84} height={16} />
        </div>
        <div className="price-main">
          <Skeleton width={180} height={36} />
          <Skeleton width={92} height={32} radius={999} />
        </div>
        <Skeleton width="100%" height={88} radius={10} />
      </article>
    );
  }

  const direction = changePct != null && changePct < 0 ? 'negative' : 'positive';
  const asset = useAsset();

  return (
    <article className="price-card" aria-live="polite">
      <div className="between">
        <p className="eyebrow">{asset.displaySymbol}</p>
        <Badge tone="neutral">Live</Badge>
      </div>
      <div className="price-main">
        <p className="data-lg">
          <RollingNumber value={price} flash />
        </p>
        <Change value={changePct} />
      </div>
      <Sparkline points={sparkline} tone={direction === 'negative' ? 'negative' : 'accent'} />
      <p className="caption faint">
        {asset.quoteSymbol ? `Pool price · ${asset.symbol}/${asset.quoteSymbol}` : 'Pool price'}
      </p>
    </article>
  );
}
