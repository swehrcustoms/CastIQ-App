import type { Regulation } from '../types/regulations';

export function formatSeason(reg: Pick<Regulation, 'openDate' | 'closeDate'>): string {
  if (!reg.openDate && !reg.closeDate) return 'Season dates have not been published';
  if (reg.openDate && !reg.closeDate) return `Opens ${reg.openDate}`;
  if (!reg.openDate && reg.closeDate) return `Through ${reg.closeDate}`;
  return `${reg.openDate} – ${reg.closeDate}`;
}

export function formatLimit(value: number | null | undefined, noun = 'daily'): string {
  if (value == null) return `No ${noun} limit published`;
  if (value === 0) return 'Closed to harvest';
  return `${value} ${noun}`;
}

export function formatSize(reg: Pick<
  Regulation,
  'catchAndReleaseOnly' | 'minSizeIn' | 'maxSizeIn' | 'slotLimitLowIn' | 'slotLimitHighIn'
>): string {
  if (reg.catchAndReleaseOnly) return 'Catch and release only';
  const parts: string[] = [];
  if (reg.minSizeIn != null) parts.push(`Minimum ${reg.minSizeIn} in`);
  if (reg.maxSizeIn != null) parts.push(`Maximum ${reg.maxSizeIn} in`);
  if (reg.slotLimitLowIn != null && reg.slotLimitHighIn != null) {
    parts.push(`Protected slot ${reg.slotLimitLowIn}–${reg.slotLimitHighIn} in`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'No size restriction published';
}
