import { cn } from '../../lib/cn';

export function Skeleton({
  width = '100%',
  height = 16,
  radius = 6,
  className,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn('skeleton', className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
