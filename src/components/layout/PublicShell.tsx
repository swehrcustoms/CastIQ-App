import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function PublicShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-dvh bg-castiq-blue-dark text-castiq-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={user ? '/' : '/login'} className="text-sm font-bold tracking-wide text-castiq-teal">
            CastIQ
          </Link>
          <nav className="flex items-center gap-4 text-sm" aria-label="Public">
            <Link to="/pricing" className="hidden text-castiq-muted hover:text-castiq-white sm:inline">Pricing</Link>
            <Link to="/guides" className="hidden text-castiq-muted hover:text-castiq-white sm:inline">Guides</Link>
            {user ? (
              <Link to="/" className="ciq-btn-primary">Open app</Link>
            ) : (
              <Link to="/login" className="ciq-btn-primary">Sign in</Link>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4 py-6 text-sm text-castiq-muted sm:px-6">
          <Link to="/pricing" className="hover:text-castiq-white">Pricing</Link>
          <Link to="/guides" className="hover:text-castiq-white">Guides</Link>
          <Link to="/legal/terms" className="hover:text-castiq-white">Terms</Link>
          <Link to="/legal/privacy" className="hover:text-castiq-white">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
