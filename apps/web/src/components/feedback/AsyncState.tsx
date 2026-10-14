import type { ReactNode } from 'react';
import { Button, State } from '../ui';

type AsyncStateProps = { children: ReactNode; retryLabel?: string; onRetry?: () => void };

export function LoadingState({ children }: Pick<AsyncStateProps, 'children'>) {
  return <State role="status">{children}</State>;
}
export function EmptyState({ children }: Pick<AsyncStateProps, 'children'>) {
  return <State>{children}</State>;
}
export function ErrorState({ children, retryLabel, onRetry }: AsyncStateProps) {
  return (
    <State role="alert">
      {children}{' '}
      {onRetry && retryLabel && (
        <Button
          type="button"
          variant="ghost"
          onClick={onRetry}
          className="min-h-0 px-1 py-0 underline"
        >
          {retryLabel}
        </Button>
      )}
    </State>
  );
}
