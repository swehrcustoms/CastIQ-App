import type { AccessTier } from './catalog';
import { PROPOSED_LIMITS } from './limits';
import type { UnlockRecord } from './unlockLedger';
import { activeUnlocks } from './unlockLedger';

export interface ReportLike {
  reportId: string;
  lakeId: string;
  species: string[];
  observedAt: number | null;
  source: string | null;
  lures: string[];
  colors: string[];
  depthFt: number | null;
  waterTempF: number | null;
  technique: string;
  timeOfDay: string;
  structureType: string | null;
  conditions: string;
  note: string | null;
}

export interface PaidReportFields {
  lures: string[];
  colors: string[];
  depthFt: number | null;
  waterTempF: number | null;
  technique: string;
  timeOfDay: string;
  structureType: string | null;
  conditions: string;
  note: string | null;
}

export interface ReportView {
  reportId: string;
  lakeId: string;
  species: string[];
  observedAt: number | null;
  source: string | null;
  detail: 'full' | 'locked';
  olderThanWindow: boolean;
  paid: PaidReportFields | null;
  lock: null | { code: 'sign_in' | 'available' | 'quota'; used: number; limit: number };
}

function paidOf(report: ReportLike): PaidReportFields {
  return {
    lures: report.lures,
    colors: report.colors,
    depthFt: report.depthFt,
    waterTempF: report.waterTempF,
    technique: report.technique,
    timeOfDay: report.timeOfDay,
    structureType: report.structureType,
    conditions: report.conditions,
    note: report.note,
  };
}

export function presentReport(input: {
  report: ReportLike;
  tier: AccessTier;
  now: number;
  authenticated: boolean;
  unlocks: UnlockRecord[];
  lakeReports?: ReportLike[];
}): ReportView {
  const { report, tier, now } = input;
  const olderThanWindow = report.observedAt == null || now - report.observedAt >= PROPOSED_LIMITS.rollingWindowMs;
  const preview = {
    reportId: report.reportId,
    lakeId: report.lakeId,
    species: report.species,
    observedAt: report.observedAt,
    source: report.source,
    olderThanWindow,
  };
  if (tier === 'premium') {
    return { ...preview, detail: 'full', paid: paidOf(report), lock: null };
  }
  if (tier === 'standard') {
    const latestId = latestReportId(input.lakeReports ?? [report]);
    const recent = report.observedAt != null && now - report.observedAt < PROPOSED_LIMITS.rollingWindowMs;
    if (recent || report.reportId === latestId) {
      return { ...preview, detail: 'full', paid: paidOf(report), lock: null, olderThanWindow: !recent };
    }
    return { ...preview, detail: 'locked', paid: null, lock: null };
  }
  const active = activeUnlocks(input.unlocks, now);
  if (active.some((record) => record.reportId === report.reportId)) {
    return { ...preview, detail: 'full', paid: paidOf(report), lock: null };
  }
  const limit = PROPOSED_LIMITS.freeFullReportUnlocksPer30Days;
  return {
    ...preview,
    detail: 'locked',
    paid: null,
    lock: input.authenticated
      ? { code: active.length >= limit ? 'quota' : 'available', used: active.length, limit }
      : { code: 'sign_in', used: 0, limit },
  };
}

export function latestReportId(reports: ReportLike[]): string | null {
  const dated = reports.filter((report) => report.observedAt != null);
  if (dated.length === 0) return reports[0]?.reportId ?? null;
  return dated.reduce((best, report) => (report.observedAt! > best.observedAt! ? report : best)).reportId;
}

export function reportsForStandard(reports: ReportLike[], now: number): ReportLike[] {
  const byLake = new Map<string, ReportLike[]>();
  for (const report of reports) {
    const list = byLake.get(report.lakeId) ?? [];
    list.push(report);
    byLake.set(report.lakeId, list);
  }
  const kept = new Map<string, ReportLike>();
  for (const [lakeId, list] of byLake) {
    const latest = latestReportId(list);
    for (const report of list) {
      const recent = report.observedAt != null && now - report.observedAt < PROPOSED_LIMITS.rollingWindowMs;
      if (recent || report.reportId === latest) kept.set(`${lakeId}:${report.reportId}`, report);
    }
  }
  return [...kept.values()];
}

export function redactPaidPayload(view: ReportView): ReportView {
  if (view.detail === 'full') return view;
  return { ...view, paid: null };
}

export function responseHasPaidFields(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false;
  const record = body as Record<string, unknown>;
  const paidKeys = ['lures', 'colors', 'depthFt', 'waterTempF', 'technique', 'structureType', 'conditions', 'note'];
  return paidKeys.some((key) => {
    const value = record[key];
    if (value == null || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
}
