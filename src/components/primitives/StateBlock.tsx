import { ArrowClockwise, type Icon as PhosphorIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Icon, type IconType } from './Icon';
import { Button } from './Button';

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state-error" role="alert">
      <Icon icon={ArrowClockwise} size={20} />
      <p className="body-md">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon,
  message,
  action,
}: {
  icon: IconType | PhosphorIcon;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="state state-empty">
      <span className="state-icon">
        <Icon icon={icon} size={24} />
      </span>
      <p className="body-md">{message}</p>
      {action}
    </div>
  );
}

export function DataBoundary({
  loading,
  error,
  empty = false,
  onRetry,
  skeleton,
  emptyState,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  onRetry?: () => void;
  skeleton: ReactNode;
  emptyState?: ReactNode;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div aria-busy="true">
        <span className="sr-only">Reading the tape…</span>
        {skeleton}
      </div>
    );
  }
  if (error) return <InlineError message={error} onRetry={onRetry} />;
  if (empty) return emptyState ?? null;
  return children;
}
