import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { signOutUser } from '../../services/auth';

export function AppHeader() {
  const { user, profile } = useAuth();

  if (!user) return null;

  const label = profile?.displayName || user.email || 'Angler';
  const initial = label.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-castiq-blue bg-castiq-blue-dark/95 px-4 py-2">
      <Link to="/" className="text-sm font-bold tracking-wide text-castiq-teal">
        CastIQ
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to="/submit-report"
          className="hidden rounded-lg bg-castiq-teal/15 px-3 py-1.5 text-xs font-medium text-castiq-teal sm:inline-block hover:bg-castiq-teal/25"
        >
          + Report
        </Link>

        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-7 w-7 rounded-full object-cover ring-1 ring-castiq-teal/40"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-castiq-blue text-xs font-bold text-castiq-teal">
              {initial}
            </span>
          )}
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-xs font-medium text-castiq-white max-w-[10rem]">
              {label}
            </p>
            {profile?.role && (
              <p className="text-[10px] capitalize text-castiq-muted">{profile.role}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void signOutUser()}
          className="rounded-lg bg-castiq-blue px-3 py-1.5 text-xs text-castiq-muted hover:text-castiq-white"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
