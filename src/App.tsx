import { BrowserRouter, Routes, Route, NavLink, useLocation, Outlet } from 'react-router-dom';
import { MapHome } from './pages/MapHome';
import { LakeSearch } from './pages/LakeSearch';
import { LakeDetail } from './pages/LakeDetail';
import { AILiveEngine } from './pages/AILiveEngine';
import { Login } from './pages/Login';
import { GuidePortal } from './pages/GuidePortal';
import { SubmitReport } from './pages/SubmitReport';
import { Regulations } from './pages/Regulations';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { AppHeader } from './components/shared/AppHeader';

function BottomNav() {
  const location = useLocation();
  const hide =
    location.pathname.startsWith('/lake/') || location.pathname === '/login';
  if (hide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-castiq-blue bg-castiq-blue-dark">
      <div className="flex">
        {[
          { to: '/', icon: '🗺', label: 'Map' },
          { to: '/search', icon: '🔍', label: 'Search' },
          { to: '/regulations', icon: '📋', label: 'Regs' },
          { to: '/submit-report', icon: '✍️', label: 'Report' },
          { to: '/guide', icon: '🎣', label: 'Guide' },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                isActive ? 'text-castiq-teal' : 'text-castiq-muted hover:text-castiq-white'
              }`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-4 px-4">
      <span className="text-5xl">🚧</span>
      <h1 className="text-xl font-bold text-castiq-white">{title}</h1>
      <p className="max-w-xs text-center text-sm text-castiq-muted">
        This section is coming in a future build phase.
      </p>
    </div>
  );
}

function AuthenticatedShell() {
  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen flex-col bg-castiq-blue-dark pb-20">
        <AppHeader />
        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AuthenticatedShell />}>
          <Route path="/" element={<MapHome />} />
          <Route path="/search" element={<LakeSearch />} />
          <Route path="/lake/:lakeId" element={<LakeDetail />} />
          <Route path="/lake/:lakeId/live" element={<AILiveEngine />} />
          <Route path="/lake/:lakeId/fisheries" element={<ComingSoon title="Fisheries Explorer" />} />
          <Route path="/lake/:lakeId/contours" element={<ComingSoon title="Lake Contours" />} />
          <Route path="/border-waters" element={<ComingSoon title="Border Waters" />} />
          <Route path="/regulations" element={<Regulations />} />
          <Route path="/submit-report" element={<SubmitReport />} />
          <Route path="/ice" element={<ComingSoon title="Ice Fishing Mode" />} />
          <Route path="/guide" element={<GuidePortal />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
