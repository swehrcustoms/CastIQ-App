import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { MapHome } from './pages/MapHome';
import { LakeSearch } from './pages/LakeSearch';
import { LakeDetail } from './pages/LakeDetail';
import { AILiveEngine } from './pages/AILiveEngine';

function BottomNav() {
  const location = useLocation();
  // Hide bottom nav on lake detail sub-pages
  const hide = location.pathname.startsWith('/lake/');
  if (hide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-castiq-blue bg-castiq-blue-dark">
      <div className="flex">
        {[
          { to: '/', icon: '🗺', label: 'Map' },
          { to: '/search', icon: '🔍', label: 'Search' },
          { to: '/regulations', icon: '📋', label: 'Regs' },
          { to: '/ice', icon: '❄️', label: 'Ice' },
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

// Stub page for routes not yet built
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-castiq-blue-dark">
      <span className="text-5xl">🚧</span>
      <h1 className="text-xl font-bold text-castiq-white">{title}</h1>
      <p className="text-sm text-castiq-muted text-center max-w-xs">
        This section is coming in a future build phase.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-castiq-blue-dark">
        <Routes>
          <Route path="/" element={<MapHome />} />
          <Route path="/search" element={<LakeSearch />} />
          <Route path="/lake/:lakeId" element={<LakeDetail />} />
          <Route path="/lake/:lakeId/live" element={<AILiveEngine />} />
          <Route path="/lake/:lakeId/fisheries" element={<ComingSoon title="Fisheries Explorer" />} />
          <Route path="/lake/:lakeId/contours" element={<ComingSoon title="Lake Contours" />} />
          <Route path="/border-waters" element={<ComingSoon title="Border Waters" />} />
          <Route path="/regulations" element={<ComingSoon title="Regulations" />} />
          <Route path="/submit-report" element={<ComingSoon title="Submit Report" />} />
          <Route path="/ice" element={<ComingSoon title="Ice Fishing Mode" />} />
          <Route path="/guide" element={<ComingSoon title="Guide Portal" />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
