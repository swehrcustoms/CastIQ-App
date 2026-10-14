import type { AnglerReport } from '../types/user';
import { toDate } from './dates';
import { canonicalSpecies } from './species';

type DateLike = Parameters<typeof toDate>[0];

export function reportIdentity(report: Pick<AnglerReport, 'sourceId' | 'aiSummary' | 'species' | 'lures' | 'depthFt' | 'technique' | 'timeOfDay' | 'waterTempF' | 'rawText'> & { reportDate?: DateLike }): string {
  const date = toDate(report.reportDate ?? null);
  const stamp = date ? String(date.getTime()) : 'undated';
  const species = [...(report.species ?? [])].sort().join(',');
  const lures = [...(report.lures ?? [])].sort().join(',');
  return [
    report.sourceId ?? '',
    stamp,
    species,
    lures,
    (report.aiSummary ?? '').trim(),
    (report.rawText ?? '').trim(),
    report.technique ?? '',
    report.timeOfDay ?? '',
    String(report.depthFt ?? ''),
    String(report.waterTempF ?? ''),
  ].join('::');
}

function reportTime(report: AnglerReport): number {
  return toDate(report.reportDate)?.getTime() ?? 0;
}

/** Newest public report for each species. A report that names two species counts for both until a newer one exists. */
export function latestReportsBySpecies(reports: AnglerReport[]): { species: string; report: AnglerReport }[] {
  const newestFirst = [...reports].sort((a, b) => reportTime(b) - reportTime(a));
  const chosen = new Map<string, AnglerReport>();
  for (const report of newestFirst) {
    const names = report.species?.length ? report.species : ['unspecified'];
    for (const name of names) {
      const key = name === 'unspecified' ? name : canonicalSpecies(name);
      if (!chosen.has(key)) chosen.set(key, report);
    }
  }
  return [...chosen.entries()]
    .map(([species, report]) => ({ species, report }))
    .sort((a, b) => reportTime(b.report) - reportTime(a.report));
}

export function uniqueReports<T extends AnglerReport>(reports: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const report of reports) {
    const contentKey = reportIdentity(report);
    const idKey = report.reportId ? `id:${report.reportId}` : '';
    if (seen.has(contentKey) || (idKey && seen.has(idKey))) continue;
    seen.add(contentKey);
    if (idKey) seen.add(idKey);
    unique.push(report);
  }
  return unique;
}
