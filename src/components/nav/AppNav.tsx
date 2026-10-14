import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { IconClose, IconIce, IconMore, IconSearch } from '../ui/Icons';

const PRIMARY = [
  { to: '/search', label: 'Search', icon: IconSearch, end: false },
  { to: '/ice', label: 'Ice', icon: IconIce, end: false },
];

export function AppNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-castiq-blue-dark md:hidden"
        aria-label="Primary"
      >
        <div className="flex">
          {PRIMARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${
                  isActive ? 'text-castiq-teal' : 'text-castiq-muted'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-castiq-muted"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <IconMore className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
      {open && <MoreDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function MoreDialog({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const links = [
    { to: '/about', label: 'About', detail: 'What CastIQ is' },
    { to: '/pricing', label: 'Pricing', detail: 'Standard and Premium' },
    { to: '/tactics', label: 'Tactics', detail: 'Seasonal bait suggestions' },
  ];
  if (profile) {
    links.push({ to: '/profile', label: 'Profile', detail: 'Favorites and your reports' });
  }
  if (profile?.guidePortalAccess || profile?.role === 'guide' || profile?.role === 'admin') {
    links.push({ to: '/guide', label: 'Guide portal', detail: 'Assigned waters and tools' });
  }

  return (
    <dialog
      ref={ref}
      className="m-0 mt-auto w-full max-w-none rounded-t-2xl border border-white/10 bg-castiq-blue-dark p-0 text-castiq-white backdrop:bg-black/60 sm:m-auto sm:max-w-md sm:rounded-2xl"
      aria-label="More destinations"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold">More</h2>
        <button type="button" onClick={onClose} aria-label="Close menu" className="text-castiq-muted">
          <IconClose />
        </button>
      </div>
      <ul className="max-h-[70vh] overflow-y-auto p-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              onClick={onClose}
              className="block rounded-lg px-3 py-3 hover:bg-castiq-blue"
            >
              <span className="block text-sm font-medium text-castiq-white">{link.label}</span>
              <span className="block text-xs text-castiq-muted">{link.detail}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
