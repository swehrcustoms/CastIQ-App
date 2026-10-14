import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  signInWithEmail,
  signInWithGoogle,
  completeGoogleRedirect,
  createAccount,
  ensureUserProfile,
  authErrorMessage,
  resetPassword,
} from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

type Mode = 'signin' | 'signup';

export function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    completeGoogleRedirect()
      .then(async (authUser) => {
        if (!authUser || !active) return;
        const profile = await ensureUserProfile(authUser, { role: 'angler' });
        if (!active) return;
        navigate(profile.created ? '/onboarding' : from, { replace: true });
      })
      .catch((err: unknown) => {
        console.error(err);
        if (active) setError(authErrorMessage(err));
      })
      .finally(() => {
        if (active) setRedirectChecked(true);
      });
    return () => {
      active = false;
    };
  }, [from, navigate]);

  if (authLoading || !redirectChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-castiq-blue-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function finishAuth(
    authUser: Awaited<ReturnType<typeof signInWithEmail>>,
    isNew: boolean
  ) {
    const profile = await ensureUserProfile(authUser, {
      role: 'angler',
      displayName: isNew ? displayName.trim() || undefined : undefined,
    });
    navigate(profile.created ? '/onboarding' : from, { replace: true });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const u = await createAccount(email.trim(), password);
        await finishAuth(u, true);
      } else {
        const u = await signInWithEmail(email.trim(), password);
        await finishAuth(u, false);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setInfo(null);
    setLoading(true);
    let redirecting = false;
    try {
      const result = await signInWithGoogle();
      if (result === 'redirect') {
        redirecting = true;
        setInfo('Opening Google sign-in…');
        return;
      }
      const profile = await ensureUserProfile(result, { role: 'angler' });
      navigate(profile.created ? '/onboarding' : from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(authErrorMessage(err));
    } finally {
      if (!redirecting) setLoading(false);
    }
  }

  async function onForgotPassword() {
    if (!email.trim()) {
      setError('Enter your email above, then tap Forgot password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setInfo('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-castiq-blue-dark px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-castiq-teal">
          CastIQ
        </p>
        <h1 className="mt-2 text-2xl font-bold text-castiq-white">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-castiq-muted">
          Lake intelligence for Minnesota anglers and guides.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-castiq-blue bg-castiq-blue p-6 shadow-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-castiq-muted">Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg bg-castiq-blue-dark px-4 py-3 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
                placeholder="Alex Angler"
                autoComplete="name"
              />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-castiq-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-castiq-blue-dark px-4 py-3 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-castiq-muted">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-castiq-blue-dark px-4 py-3 text-sm text-castiq-white outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          {info && (
            <p className="rounded-lg bg-castiq-teal/10 px-3 py-2 text-sm text-castiq-teal">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-castiq-teal py-3 text-sm font-semibold text-castiq-blue-dark hover:bg-castiq-teal/90 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" /> : null}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-castiq-blue-dark" />
          <span className="text-xs text-castiq-muted">or</span>
          <div className="h-px flex-1 bg-castiq-blue-dark" />
        </div>

        <button
          type="button"
          onClick={() => void onGoogle()}
          disabled={loading}
          className="w-full rounded-lg border border-castiq-blue-dark bg-castiq-blue-dark py-3 text-sm font-medium text-castiq-white hover:border-castiq-teal/40 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm">
          {mode === 'signin' ? (
            <>
              <button
                type="button"
                onClick={() => void onForgotPassword()}
                className="text-castiq-muted hover:text-castiq-teal"
              >
                Forgot password?
              </button>
              <p className="text-castiq-muted">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-medium text-castiq-teal hover:underline"
                >
                  Create an account
                </button>
              </p>
            </>
          ) : (
            <p className="text-castiq-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-medium text-castiq-teal hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <nav className="mt-6 flex justify-center gap-4 text-xs text-castiq-muted" aria-label="Product">
          <Link to="/about" className="hover:text-castiq-teal">About</Link>
          <Link to="/tactics" className="hover:text-castiq-teal">Tactics</Link>
          <Link to="/pricing" className="hover:text-castiq-teal">Pricing</Link>
        </nav>
      </div>
    </div>
  );
}
