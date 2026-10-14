import type { Lake } from '../types/lake';
import { toDate } from './dates';

export function latestReportTime(lake: Pick<Lake, 'lastReportDate'>): number | null {
  const date = toDate(lake.lastReportDate);
  return date ? date.getTime() : null;
}

export function compareLakesByLatestReport<T extends Pick<Lake, 'lastReportDate' | 'name'> & { id?: string }>(a: T, b: T): number {
  const aTime = latestReportTime(a);
  const bTime = latestReportTime(b);
  if (aTime == null && bTime != null) return 1;
  if (aTime != null && bTime == null) return -1;
  if (aTime != null && bTime != null && aTime !== bTime) return bTime - aTime;
  const byName = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  if (byName !== 0) return byName;
  return (a.id ?? '').localeCompare(b.id ?? '');
}
