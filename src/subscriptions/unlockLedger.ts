import { PROPOSED_LIMITS } from './limits';

export interface UnlockRecord {
  reportId: string;
  unlockedAt: number;
}

export type UnlockDenial = 'unauthenticated' | 'quota' | 'invalid_report';

export interface UnlockResult {
  ok: boolean;
  code: 'opened' | 'reopened' | UnlockDenial;
  charged: boolean;
  used: number;
  limit: number;
  records: UnlockRecord[];
}

export function canonicalReportId(reportId: string): string | null {
  const id = reportId.trim();
  if (!id || id !== reportId || /[\s/]/.test(id)) return null;
  return id;
}

export function activeUnlocks(records: UnlockRecord[], now: number, windowMs = PROPOSED_LIMITS.rollingWindowMs): UnlockRecord[] {
  return records.filter((record) => now - record.unlockedAt < windowMs && now >= record.unlockedAt);
}

export function decideUnlock(input: {
  records: UnlockRecord[];
  reportId: string;
  now: number;
  authenticated: boolean;
  limit?: number;
}): UnlockResult {
  const limit = input.limit ?? PROPOSED_LIMITS.freeFullReportUnlocksPer30Days;
  const reportId = canonicalReportId(input.reportId);
  const active = activeUnlocks(input.records, input.now);
  if (!reportId) {
    return { ok: false, code: 'invalid_report', charged: false, used: active.length, limit, records: input.records };
  }
  if (!input.authenticated) {
    return { ok: false, code: 'unauthenticated', charged: false, used: active.length, limit, records: input.records };
  }
  const existing = active.find((record) => record.reportId === reportId);
  if (existing) {
    return { ok: true, code: 'reopened', charged: false, used: active.length, limit, records: input.records };
  }
  if (active.length >= limit) {
    return { ok: false, code: 'quota', charged: false, used: active.length, limit, records: input.records };
  }
  const records = [...input.records, { reportId, unlockedAt: input.now }];
  return { ok: true, code: 'opened', charged: true, used: active.length + 1, limit, records };
}

/** Serialize contending opens the way a Firestore transaction must. Exactly one new id can take the last credit. */
export function settleUnlockRace(
  records: UnlockRecord[],
  reportIds: string[],
  now: number,
  authenticated = true,
): UnlockResult[] {
  let current = records;
  return reportIds.map((reportId) => {
    const result = decideUnlock({ records: current, reportId, now, authenticated });
    current = result.records;
    return result;
  });
}
