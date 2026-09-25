import { formatPrice } from '../../lib/format';
import { cn } from '../../lib/cn';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { useFlash } from '../../hooks/useFlash';

export function RollingNumber({
  value,
  format = formatPrice,
  className,
  flash = false,
}: {
  value: number | null;
  format?: (value: number) => string;
  className?: string;
  flash?: boolean;
}) {
  const animated = useAnimatedNumber(value);
  const direction = useFlash(flash ? value : null);
  const rendered = animated == null ? format(Number.NaN) : format(animated);

  return <span className={cn(className, direction === 'up' && 'flash-up', direction === 'down' && 'flash-down')}>{rendered}</span>;
}
