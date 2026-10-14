import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { LakeSearch } from './pages/LakeSearch';
import { LakeDetail } from './pages/LakeDetail';
import { Login } from './pages/Login';
import { IceFishing } from './pages/IceFishing';
import { Pricing } from './pages/Pricing';
import { Guides } from './pages/Guides';
import { About } from './pages/About';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { AppHeader } from './components/shared/AppHeader';
import { AppNav } from './components/nav/AppNav';

function LakeRedirect({ tab }: { tab?: 'surveys' }) {
  const { lakeId } = useParams();
  const target = lakeId ? `/lake/${lakeId}${tab ? `?tab=${tab}` : ''}` : '/search';
  return <Navigate to={target} replace />;
}

function SiteShell() {
  const location = useLocation();
  const hideNav = location.pathname === '/onboarding';

  return (
    <div className="flex min-h-dvh flex-col bg-castiq-blue-dark">
      <AppHeader />
      <main className={hideNav ? 'flex-1' : 'flex-1 pb-20 md:pb-8'}>
        <Outlet />
      </main>
      {!hideNav && <AppNav />}
    </div>
  );
}

function AuthenticatedShell() {
  return (
    <ProtectedRoute>
      <SiteShell />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-in" element={<Navigate to="/login" replace />} />
        <Route element={<SiteShell />}>
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/tactics" element={<Guides />} />
          <Route path="/guides" element={<Navigate to="/tactics" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/privacy" element={<Privacy />} />
        </Route>

        <Route element={<AuthenticatedShell />}>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<LakeSearch />} />
          <Route path="/lake/:lakeId" element={<LakeDetail />} />
          <Route path="/lake/:lakeId/live" element={<LakeRedirect />} />
          <Route path="/lake/:lakeId/fisheries" element={<LakeRedirect tab="surveys" />} />
          <Route path="/lake/:lakeId/contours" element={<LakeRedirect />} />
          <Route path="/border-waters" element={<Navigate to="/search" replace />} />
          <Route path="/regulations" element={<Navigate to="/search" replace />} />
          <Route path="/submit-report" element={<Navigate to="/search" replace />} />
          <Route path="/ice" element={<IceFishing />} />
          <Route path="/guide" element={<Navigate to="/search" replace />} />
          <Route path="/profile" element={<Navigate to="/search" replace />} />
          <Route path="/social" element={<Navigate to="/search" replace />} />
          <Route path="/onboarding" element={<Navigate to="/search" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
