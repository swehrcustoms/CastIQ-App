import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatRelative, toDate } from '../../utils/dates';
import type { Timestamp } from '../../types/common';

export function AppCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`ciq-card p-4 ${className}`}>{children}</section>;
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="ciq-card p-4">
      <p className="text-xs text-castiq-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-snug text-castiq-white">{value}</p>
      {detail && <p className="mt-1 text-xs leading-relaxed text-castiq-muted">{detail}</p>}
    </div>
  );
}

export function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-castiq-teal ${
        selected
          ? 'bg-castiq-teal text-castiq-blue-dark'
          : 'bg-castiq-blue text-castiq-muted hover:text-castiq-white'
      }`}
    >
      {children}
    </button>
  );
}

export function DataFreshnessBadge({
  date,
  prefix = 'Updated',
}: {
  date: Date | Timestamp | { seconds: number } | null | undefined;
  prefix?: string;
}) {
  const resolved = date instanceof Date || date == null ? (date as Date | null) : toDate(date);
  const label = resolved ? `${prefix} ${formatRelative(resolved)}` : 'Date unavailable';
  return (
    <span className="inline-flex items-center rounded-full bg-castiq-blue-dark px-2.5 py-1 text-xs text-castiq-muted">
      {label}
    </span>
  );
}

export function LakeLink({
  lakeId,
  children,
  className = 'font-medium text-castiq-teal hover:underline',
}: {
  lakeId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={`/lake/${lakeId}`} className={className}>
      {children}
    </Link>
  );
}
