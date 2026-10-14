import type { Lake } from '../types/lake';
import { toDate } from './dates';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface ReportRecency {
  lastReportDate: Lake['lastReportDate'];
  reportCount7d: number;
}

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

/** Newest public report, plus how many of those reports fall in the last 7 days. */
export function recencyFromReports(
  reports: Array<{ reportDate?: Lake['lastReportDate'] }>,
  now = Date.now(),
): ReportRecency {
  let lastReportDate: Lake['lastReportDate'] = null;
  let latestTime = Number.NEGATIVE_INFINITY;
  let reportCount7d = 0;
  for (const report of reports) {
    const date = toDate(report.reportDate);
    if (!date) continue;
    const time = date.getTime();
    if (time > latestTime) {
      latestTime = time;
      lastReportDate = report.reportDate ?? null;
    }
    if (time <= now && now - time <= WEEK_MS) reportCount7d += 1;
  }
  return { lastReportDate, reportCount7d };
}

export function lakeWithReportRecency<T extends { id?: string; lastReportDate: Lake['lastReportDate']; reportCount7d?: number }>(
  lake: T,
  recency: Record<string, ReportRecency>,
): T {
  const live = lake.id ? recency[lake.id] : undefined;
  if (!live) return lake;
  return { ...lake, lastReportDate: live.lastReportDate, reportCount7d: live.reportCount7d };
}

/** Lakes with a newer report come first. Equal dates keep the closer name match, then the lake name. */
export function compareSearchLakes<T extends Pick<Lake, 'lastReportDate' | 'name'> & { id?: string; matchScore?: number }>(
  a: T,
  b: T,
): number {
  const aTime = latestReportTime(a);
  const bTime = latestReportTime(b);
  if (aTime !== bTime) return compareLakesByLatestReport(a, b);
  const byScore = (a.matchScore ?? 99) - (b.matchScore ?? 99);
  if (byScore !== 0) return byScore;
  return compareLakesByLatestReport(a, b);
}
