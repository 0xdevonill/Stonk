import { ArrowDown, ArrowUp, Minus } from '@phosphor-icons/react';
import { formatPct, formatUsd } from '../../lib/format';
import { cn } from '../../lib/cn';
import { Icon } from '../primitives/Icon';

export function Change({
  value,
  mode = 'pct',
  className,
}: {
  value: number | null;
  mode?: 'pct' | 'usd';
  className?: string;
}) {
  const direction = value == null ? 'flat' : value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const glyph = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus;
  const label = mode === 'usd' ? formatUsd(value) : formatPct(value);

  return (
    <span className={cn('change', `change-${direction}`, className)}>
      <Icon icon={glyph} size={20} />
      <span className="num">{label}</span>
    </span>
  );
}
