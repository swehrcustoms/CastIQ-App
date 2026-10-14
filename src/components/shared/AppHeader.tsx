import { NavLink, Link } from 'react-router-dom';
import { signOutUser } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';

const LINKS = [
  { to: '/search', label: 'Search' },
  { to: '/ice', label: 'Ice' },
  { to: '/tactics', label: 'Tactics' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
];

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-castiq-blue-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
        <Link to="/search" className="text-sm font-bold tracking-wide text-castiq-teal">
          CastIQ
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-castiq-teal/15 text-castiq-teal' : 'text-castiq-muted hover:text-castiq-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="text-xs font-medium text-castiq-muted hover:text-castiq-white"
            >
              Sign out
            </button>
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
