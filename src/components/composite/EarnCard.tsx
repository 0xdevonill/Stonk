import type { EarnAsset, EarnEligibility } from '../../lib/api';
import { formatToken, PLACEHOLDER_NUMBER } from '../../lib/format';
import { Badge } from '../primitives/Badge';
import { Change } from '../data/Change';
import { RollingNumber } from '../data/RollingNumber';
import { formatPrice } from '../../lib/format';

const eligibilityCopy: Record<EarnEligibility, { label: string; tone: 'positive' | 'neutral' | 'warning' }> = {
  eligible: { label: 'Eligible', tone: 'positive' },
  ineligible: { label: 'Not eligible', tone: 'neutral' },
  soon: { label: 'Coming soon', tone: 'warning' },
};

export function EarnCard({ asset, holding }: { asset: EarnAsset; holding: number | null }) {
  const badge = eligibilityCopy[asset.eligibility];
  return (
    <article className="earn-card card">
      <div className="between">
        <div>
          <p className="heading-sm">{asset.name}</p>
          <p className="caption faint num">{asset.ticker}</p>
        </div>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <div className="between">
        <p className="data-md">
          <RollingNumber value={asset.priceUsd} format={formatPrice} />
        </p>
        <Change value={asset.change24hPct} />
      </div>
      <p className="caption muted">
        Your holding <span className="num">{holding == null ? PLACEHOLDER_NUMBER : formatToken(holding)}</span>
      </p>
      <p className="body-md muted">{asset.blurb}</p>
    </article>
  );
}
