import { NavLink } from 'react-router-dom';

const PRIMARY = [
  { to: '/search', label: 'Search' },
  { to: '/ice', label: 'Ice' },
  { to: '/tactics', label: 'Tactics' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
];

export function AppNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-castiq-blue-dark md:hidden"
      aria-label="Primary"
    >
      <div className="flex">
        {PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 items-center justify-center px-1 text-center text-[11px] font-medium ${
                isActive ? 'text-castiq-teal' : 'text-castiq-muted'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
