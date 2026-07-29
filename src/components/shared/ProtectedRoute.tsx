import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
}

/** Redirects unauthenticated users to /login, preserving the intended destination. */
export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-castiq-blue-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
