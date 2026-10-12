import type { ReactNode } from 'react';

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="ciq-card px-5 py-10 text-center">
      <h2 className="text-base font-semibold text-castiq-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-castiq-muted">{message}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  onRetry,
}: {
  title: string;
  onRetry?: () => void;
}) {
  return (
    <div className="ciq-card px-5 py-8 text-center" role="alert">
      <h2 className="text-base font-semibold text-castiq-white">{title}</h2>
      <p className="mt-2 text-sm text-castiq-muted">Check your connection, then try again.</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ciq-btn-primary mt-4">
          Try again
        </button>
      )}
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="ciq-card animate-pulse p-4" aria-hidden="true">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-3 h-5 w-2/3 rounded bg-white/10" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-3 rounded bg-white/10" style={{ width: `${92 - index * 14}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function AlertBanner({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warning' | 'critical';
  children: ReactNode;
}) {
  const tones = {
    info: 'border-castiq-teal/30 bg-castiq-teal/10',
    warning: 'border-castiq-yellow/40 bg-castiq-yellow/10',
    critical: 'border-castiq-red/40 bg-red-950/40',
  };
  return (
    <div role="note" className={`rounded-xl border px-4 py-3 text-sm leading-relaxed text-castiq-white ${tones[tone]}`}>
      {children}
    </div>
  );
}
