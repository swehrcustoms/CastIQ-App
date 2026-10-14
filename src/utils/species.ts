import { SPECIES_OPTIONS } from '../components/shared/SpeciesChips';

export function speciesLabel(value: string): string {
  const cleaned = value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Unknown species';
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function canonicalSpecies(value: string): string {
  const key = value.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '');
  if (key.includes('walleye')) return 'walleye';
  if (key.includes('musk')) return 'muskie';
  if (key.includes('crappie')) return 'crappie';
  if (key.includes('perch')) return 'yellow_perch';
  if (key.includes('smallmouth')) return 'smallmouth_bass';
  if (key.includes('largemouth') || key.includes('bass')) return 'largemouth_bass';
  if (key.includes('trout')) return 'lake_trout';
  if (key.includes('bluegill') || key.includes('sunfish') || key.includes('panfish')) return 'panfish';
  if (key.includes('pike') || key.includes('northern')) return 'northern_pike';
  return key;
}

export function speciesMatches(value: string, selected: string): boolean {
  if (!selected || selected === 'all') return true;
  return canonicalSpecies(value) === canonicalSpecies(selected);
}

export function chipLabel(id: string): string {
  return SPECIES_OPTIONS.find((option) => option.id === id)?.label ?? speciesLabel(id);
}

/** Map a lake species name onto one of the standard chips. Names outside that list are skipped. */
export function chipIdForSpecies(value: string): string | null {
  const key = value.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '');
  if (!key) return null;
  if (key.includes('walleye')) return 'walleye';
  if (key.includes('musk')) return 'muskie';
  if (key.includes('crappie')) return 'crappie';
  if (key.includes('trout_perch')) return null;
  if (key.includes('perch')) return 'yellow_perch';
  if (key.includes('smallmouth') || key.includes('largemouth')) return 'largemouth_bass';
  if (key.includes('white_bass') || key.includes('yellow_bass') || key.includes('rock_bass')) return 'panfish';
  if (key === 'bass') return 'largemouth_bass';
  if (key.includes('trout')) return 'lake_trout';
  if (key.includes('bluegill') || key.includes('sunfish') || key === 'panfish') return 'panfish';
  if (key.includes('pike')) return 'northern_pike';
  return null;
}

/** Standard chip order, with species that are not in this lake removed. All stays. */
export function chipsForLake(speciesPresent: string[] | undefined) {
  const present = new Set(
    (speciesPresent ?? []).map(chipIdForSpecies).filter((id): id is string => id != null),
  );
  return SPECIES_OPTIONS.filter((option) => option.id === 'all' || present.has(option.id));
}

/** Species names for the lake header, in the same order as the filter chips. */
export function speciesShownForLake(speciesPresent: string[] | undefined): string[] {
  const grouped = new Map<string, string[]>();
  for (const name of speciesPresent ?? []) {
    const id = chipIdForSpecies(name);
    if (!id) continue;
    const names = grouped.get(id) ?? [];
    if (!names.some((existing) => existing.toLowerCase() === name.toLowerCase())) names.push(name);
    grouped.set(id, names);
  }
  return SPECIES_OPTIONS.filter((option) => option.id !== 'all' && grouped.has(option.id)).flatMap(
    (option) => grouped.get(option.id) ?? [],
  );
}
