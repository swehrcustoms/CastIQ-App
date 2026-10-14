import assert from 'node:assert/strict';
import test from 'node:test';
import { compareLakesByLatestReport } from '../src/utils/lakeSort';
import { uniqueReports } from '../src/utils/reportIdentity';
import { PLAN_PRICES, priceFor, tierHasEntitlement } from '../src/data/pricing';
import type { AnglerReport } from '../src/types/user';
import type { Lake } from '../src/types/lake';

function lake(partial: Pick<Lake, 'name' | 'lastReportDate'> & { id: string }): Pick<Lake, 'name' | 'lastReportDate'> & { id: string } {
  return partial;
}

test('search sort uses newest report date and puts lakes without reports last', () => {
  const older = lake({ id: 'a', name: 'Cedar', lastReportDate: { seconds: 100, toDate: () => new Date(100_000) } });
  const newer = lake({ id: 'b', name: 'Leech', lastReportDate: { seconds: 500, toDate: () => new Date(500_000) } });
  const none = lake({ id: 'c', name: 'Ada', lastReportDate: null });
  const ranked = [older, none, newer].sort(compareLakesByLatestReport);
  assert.deepEqual(ranked.map((item) => item.name), ['Leech', 'Cedar', 'Ada']);
});

test('equal report dates tie-break by lake name', () => {
  const stamp = { seconds: 10, toDate: () => new Date(10_000) };
  const ranked = [
    lake({ id: '2', name: 'Zebra', lastReportDate: stamp }),
    lake({ id: '1', name: 'Alpha', lastReportDate: stamp }),
  ].sort(compareLakesByLatestReport);
  assert.equal(ranked[0].name, 'Alpha');
});

test('identical report content is shown once', () => {
  const shared = {
    lakeId: 'low',
    lakeName: 'Lake of the Woods',
    sourceId: 'seed_demo',
    userId: null,
    reportDate: { seconds: 20, toDate: () => new Date(20_000) },
    species: ['walleye'],
    lures: ['jig'],
    colors: ['chartreuse'],
    depthFt: 12,
    waterTempF: 55,
    conditions: 'clear',
    technique: 'jigging',
    timeOfDay: 'morning' as const,
    aiSummary: 'Walleye on the jig',
    userSubmitted: false,
    isPublic: true,
    verified: false,
    upvotes: 0,
    photoUrl: null,
    rawText: 'same',
    confidenceScore: 0,
    structureType: 'reef',
    createdAt: { seconds: 1, toDate: () => new Date(1000) },
    updatedAt: { seconds: 1, toDate: () => new Date(1000) },
  };
  const reports = uniqueReports([
    { ...shared, reportId: 'doc-a' },
    { ...shared, reportId: 'doc-b' },
  ] as AnglerReport[]);
  assert.equal(reports.length, 1);
});

test('different reports stay separate', () => {
  const base = {
    lakeId: 'low',
    lakeName: 'Lake of the Woods',
    sourceId: 'rss',
    userId: null,
    species: ['walleye'],
    lures: ['jig'],
    colors: [],
    depthFt: 10,
    waterTempF: null,
    conditions: '',
    technique: '',
    timeOfDay: 'morning' as const,
    userSubmitted: false,
    isPublic: true,
    verified: false,
    upvotes: 0,
    photoUrl: null,
    rawText: '',
    confidenceScore: 0,
    structureType: null,
    createdAt: { seconds: 1, toDate: () => new Date(1000) },
    updatedAt: { seconds: 1, toDate: () => new Date(1000) },
  };
  const reports = uniqueReports([
    { ...base, reportId: '1', aiSummary: 'Morning', reportDate: { seconds: 10, toDate: () => new Date(10_000) } },
    { ...base, reportId: '2', aiSummary: 'Evening', reportDate: { seconds: 20, toDate: () => new Date(20_000) } },
  ] as AnglerReport[]);
  assert.equal(reports.length, 2);
});

test('four approved prices and premium inheritance', () => {
  assert.deepEqual(PLAN_PRICES.map((price) => price.cents), [499, 3999, 899, 6999]);
  assert.equal(priceFor('standard', 'annual').display, '$39.99/year');
  assert.equal(priceFor('premium', 'monthly').display, '$8.99/month');
  assert.equal(tierHasEntitlement('standard', 'fishing_reports'), true);
  assert.equal(tierHasEntitlement('standard', 'saved_lake_dashboard'), false);
  assert.equal(tierHasEntitlement('premium', 'saved_lake_dashboard'), true);
  assert.equal(tierHasEntitlement('premium', 'fishing_reports'), true);
});
