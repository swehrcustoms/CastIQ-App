import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function BackButton({ to, label = 'Back' }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  const className = 'inline-flex items-center text-sm text-castiq-muted hover:text-castiq-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-castiq-teal';
  if (to) {
    return (
      <Link to={to} className={className}>
        ← {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => navigate(-1)} className={className}>
      ← {label}
    </button>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  backTo,
  backLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backTo && (
          <div className="mb-2">
            <BackButton to={backTo} label={backLabel} />
          </div>
        )}
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wide text-castiq-teal">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold text-castiq-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-castiq-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-castiq-white">{title}</h2>
      {action}
    </div>
  );
}

export function SourceFooter({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-castiq-muted">{children}</p>;
}
