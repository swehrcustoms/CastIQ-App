import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

function Svg({ className = 'h-5 w-5', children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconMap(props: IconProps) {
  return (
    <Svg {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.5 3.5 17.8A1 1 0 0 1 3 16.9V6.2a1 1 0 0 1 .5-.87L9 2.5m0 18 6-2.7m-6 2.7V2.5m6 15.3 5.5 2.5a1 1 0 0 0 1.5-.87V7.1a1 1 0 0 0-.5-.87L15 3.5m0 14.3V3.5" />
    </Svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m16 16 4 4" />
    </Svg>
  );
}

export function IconIce(props: IconProps) {
  return (
    <Svg {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 12 5 8M12 12l7-4M12 12 5 16M12 12l7 4M7.5 5.5 12 8l4.5-2.5M7.5 18.5 12 16l4.5 2.5" />
    </Svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <path strokeLinecap="round" d="M16 19v-1.2A3.8 3.8 0 0 0 12.2 14H7.8A3.8 3.8 0 0 0 4 17.8V19" />
      <circle cx="10" cy="8" r="3" />
      <path strokeLinecap="round" d="M20 19v-1.1A3.2 3.2 0 0 0 17.2 15M16 5.2a3 3 0 0 1 0 5.6" />
    </Svg>
  );
}

export function IconMore(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}
