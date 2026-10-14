import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function UpgradeCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mt-3 rounded-lg border border-white/10 p-3">
      <p className="text-sm font-medium text-castiq-white">{title}</p>
      <p className="mt-1 text-xs text-castiq-muted">{detail}</p>
      <Link to="/pricing" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-castiq-teal">
        View plans
      </Link>
    </div>
  );
}

export function FeatureGate({
  enforced,
  allowed,
  title,
  detail,
  children,
}: {
  enforced: boolean;
  allowed: boolean;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  if (!enforced || allowed) return <>{children}</>;
  return <UpgradeCard title={title} detail={detail} />;
}
