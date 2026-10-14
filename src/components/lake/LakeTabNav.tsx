const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'surveys', label: 'Surveys & Stocking' },
] as const;

export type LakeTab = (typeof TABS)[number]['id'];

export function isLakeTab(value: string | null): value is LakeTab {
  return TABS.some((tab) => tab.id === value);
}

interface Props {
  active: LakeTab;
  onSelect: (tab: LakeTab) => void;
}

export function LakeTabNav({ active, onSelect }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-castiq-blue pb-0 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
            active === tab.id
              ? 'text-castiq-teal'
              : 'text-castiq-muted hover:text-castiq-white'
          }`}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-castiq-teal" />
          )}
        </button>
      ))}
    </div>
  );
}
