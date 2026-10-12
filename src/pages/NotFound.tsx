import { Link } from 'react-router-dom';
import { PageContainer } from '../components/ui/Chrome';
import { usePageTitle } from '../hooks/usePageTitle';

export function NotFound() {
  usePageTitle('Page not found');
  return (
    <PageContainer className="flex min-h-[60vh] flex-col items-start justify-center">
      <p className="text-sm font-bold tracking-wide text-castiq-teal">CastIQ</p>
      <h1 className="mt-3 text-3xl font-bold text-castiq-white">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-castiq-muted">
        That address isn’t part of CastIQ. The map and lake search are the fastest way back to the water.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/" className="ciq-btn-primary">Go to Map</Link>
        <Link to="/search" className="ciq-btn-secondary">Search Lakes</Link>
      </div>
    </PageContainer>
  );
}
