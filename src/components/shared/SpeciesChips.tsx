const SPECIES_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'walleye', label: 'Walleye' },
  { id: 'largemouth_bass', label: 'Bass' },
  { id: 'northern_pike', label: 'Pike' },
  { id: 'panfish', label: 'Panfish' },
  { id: 'muskie', label: 'Muskie' },
  { id: 'lake_trout', label: 'Trout' },
  { id: 'crappie', label: 'Crappie' },
  { id: 'yellow_perch', label: 'Perch' },
];

interface Props {
  selected: string;
  onChange: (species: string) => void;
  className?: string;
  options?: { id: string; label: string }[];
}

export function SpeciesChips({ selected, onChange, className = '', options = SPECIES_OPTIONS }: Props) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide ${className}`}>
      {options.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === s.id
              ? 'bg-castiq-teal text-castiq-blue-dark'
              : 'bg-castiq-blue text-castiq-muted hover:bg-castiq-blue/80 hover:text-castiq-white'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export { SPECIES_OPTIONS };
