import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LINKS = [
  { to: '/search', label: 'Search', end: false },
  { to: '/ice', label: 'Ice', end: false },
];

export function AppHeader() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const focused = location.pathname === '/onboarding';

  const label = profile?.displayName || user?.displayName || user?.email || 'Angler';
  const initial = label.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-castiq-blue-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
        <Link to="/" className="text-sm font-bold tracking-wide text-castiq-teal">
          CastIQ
        </Link>

        {!focused && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    isActive ? 'bg-castiq-teal/15 text-castiq-teal' : 'text-castiq-muted hover:text-castiq-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-lg px-2.5 py-1.5 text-xs font-medium text-castiq-muted hover:text-castiq-white">
                More
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-white/10 bg-castiq-blue p-1 shadow-lg">
                <HeaderLink to="/about" label="About" />
                <HeaderLink to="/tactics" label="Tactics" />
                <HeaderLink to="/pricing" label="Pricing" />
                {(profile?.guidePortalAccess || profile?.role === 'guide' || profile?.role === 'admin') && (
                  <HeaderLink to="/guide" label="Guide portal" />
                )}
              </div>
            </details>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user ? (
          <Link to="/profile" className="flex items-center gap-2 rounded-full" aria-label="Open profile">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-castiq-teal/40" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-castiq-blue text-xs font-bold text-castiq-teal">
                {initial}
              </span>
            )}
            <span className="hidden max-w-[8rem] truncate text-xs font-medium text-castiq-white lg:inline">
              {label}
            </span>
          </Link>
          ) : (
            <Link to="/login" className="text-xs font-medium text-castiq-teal hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ to, label, className = '' }: { to: string; label: string; className?: string }) {
  return (
    <Link to={to} className={`block rounded-lg px-3 py-2 text-sm text-castiq-white hover:bg-castiq-blue-dark ${className}`}>
      {label}
    </Link>
  );
}
