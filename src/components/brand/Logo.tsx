import { cn } from '../../lib/cn';

export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 26V4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M6 8.5 16 18.5 26 8.5V30"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
