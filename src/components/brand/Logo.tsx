import { cn } from '../../lib/cn';

export function TokenLogo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <img
      className={cn('token-logo', className)}
      src="/mr-stonk.png"
      alt=""
      width={size}
      height={size}
    />
  );
}

export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return <TokenLogo size={size} className={className} />;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('wordmark', className)}>
      Mr<i className="wordmark-dot" />
      Stonk
    </span>
  );
}

export function Lockup({
  variant = 'horizontal',
  markSize = 28,
}: {
  variant?: 'horizontal' | 'stacked';
  markSize?: number;
}) {
  return (
    <span className={cn('lockup', variant === 'stacked' && 'lockup-stacked')}>
      <Mark size={markSize} />
      <Wordmark />
    </span>
  );
}
