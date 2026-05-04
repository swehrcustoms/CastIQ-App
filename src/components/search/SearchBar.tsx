import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, placeholder = 'Search lakes…', autoFocus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-castiq-muted">
        🔍
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg bg-castiq-blue py-3 pl-10 pr-4 text-sm text-castiq-white placeholder-castiq-muted outline-none ring-1 ring-castiq-blue focus:ring-castiq-teal"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-castiq-muted hover:text-castiq-white"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
