import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { MapHome } from './pages/MapHome';
import { LakeSearch } from './pages/LakeSearch';
import { LakeDetail } from './pages/LakeDetail';
import { AILiveEngine } from './pages/AILiveEngine';
import { Login } from './pages/Login';
import { GuidePortal } from './pages/GuidePortal';
import { SubmitReport } from './pages/SubmitReport';
import { Regulations } from './pages/Regulations';
import { FisheriesExplorer } from './pages/FisheriesExplorer';
import { LakeContours } from './pages/LakeContours';
import { BorderWaters } from './pages/BorderWaters';
import { IceFishing } from './pages/IceFishing';
import { Profile } from './pages/Profile';
import { Social } from './pages/Social';
import { Onboarding } from './pages/Onboarding';
import { Pricing } from './pages/Pricing';
import { Guides } from './pages/Guides';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { AppHeader } from './components/shared/AppHeader';
import { AppNav } from './components/nav/AppNav';
import { useAuth } from './hooks/useAuth';

function OnboardingGate({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const location = useLocation();
  const allowed = location.pathname === '/onboarding' || location.pathname === '/profile';
  if (!loading && profile?.onboardingComplete === false && !allowed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function AuthenticatedShell() {
  const location = useLocation();
  const showNav = !location.pathname.startsWith('/lake/') && location.pathname !== '/onboarding';

  return (
    <ProtectedRoute>
      <OnboardingGate>
        <div className="flex min-h-dvh flex-col bg-castiq-blue-dark">
          <AppHeader />
          <main className={showNav ? 'flex-1 pb-20 md:pb-8' : 'flex-1'}>
            <Outlet />
          </main>
          <AppNav />
        </div>
      </OnboardingGate>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-in" element={<Navigate to="/login" replace />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/privacy" element={<Privacy />} />

        <Route element={<AuthenticatedShell />}>
          <Route path="/" element={<MapHome />} />
          <Route path="/search" element={<LakeSearch />} />
          <Route path="/lake/:lakeId" element={<LakeDetail />} />
          <Route path="/lake/:lakeId/live" element={<AILiveEngine />} />
          <Route path="/lake/:lakeId/fisheries" element={<FisheriesExplorer />} />
          <Route path="/lake/:lakeId/contours" element={<LakeContours />} />
          <Route path="/border-waters" element={<BorderWaters />} />
          <Route path="/regulations" element={<Regulations />} />
          <Route path="/submit-report" element={<SubmitReport />} />
          <Route path="/ice" element={<IceFishing />} />
          <Route path="/guide" element={<GuidePortal />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/social" element={<Social />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
