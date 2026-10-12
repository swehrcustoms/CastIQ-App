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
