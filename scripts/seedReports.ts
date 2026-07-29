/**
 * Seed realistic demo angler_reports tied to Tier-1 lakes.
 *
 * Usage:
 *   FIREBASE_PROJECT_ID=castiq-app tsx scripts/seedReports.ts
 *   # or with service account:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json tsx scripts/seedReports.ts
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'castiq-app' });
}

const db = getFirestore();

const DEMO_REPORTS = [
  {
    lakeId: '48-0259-00',
    lakeName: 'Mille Lacs Lake',
    species: ['walleye'],
    lures: ['jig', 'crawler'],
    colors: ['chartreuse', 'gold'],
    depthFt: 18,
    waterTempF: 62,
    conditions: 'Light SW wind, partly cloudy. Bite best 30 minutes before dusk on mud flats.',
    technique: 'Slip bobber / jig',
    timeOfDay: 'evening' as const,
    structureType: 'mud flat',
    hoursAgo: 6,
  },
  {
    lakeId: '48-0259-00',
    lakeName: 'Mille Lacs Lake',
    species: ['smallmouth_bass', 'walleye'],
    lures: ['tube', 'ned rig'],
    colors: ['green pumpkin'],
    depthFt: 12,
    waterTempF: 64,
    conditions: 'Rocky points producing smallies; a few walleyes mixed in.',
    technique: 'Casting',
    timeOfDay: 'morning' as const,
    structureType: 'rocky point',
    hoursAgo: 28,
  },
  {
    lakeId: '11-0182-00',
    lakeName: 'Leech Lake',
    species: ['walleye'],
    lures: ['spinner harness'],
    colors: ['orange', 'chartreuse'],
    depthFt: 10,
    waterTempF: 58,
    conditions: 'Trolling mid-lake reefs 1.2–1.6 mph. Steady bite mid-morning.',
    technique: 'Slow troll',
    timeOfDay: 'morning' as const,
    structureType: 'reef',
    hoursAgo: 12,
  },
  {
    lakeId: '11-0182-00',
    lakeName: 'Leech Lake',
    species: ['muskie'],
    lures: ['bucktail'],
    colors: ['black', 'chartreuse'],
    depthFt: 8,
    waterTempF: 60,
    conditions: 'Follows on weed edges; one fish landed late afternoon.',
    technique: 'Casting',
    timeOfDay: 'afternoon' as const,
    structureType: 'weedline',
    hoursAgo: 40,
  },
  {
    lakeId: 'LOTW-MN',
    lakeName: 'Lake of the Woods',
    species: ['walleye', 'sauger'],
    lures: ['jig', 'minnow'],
    colors: ['glow', 'orange'],
    depthFt: 28,
    waterTempF: 52,
    conditions: 'South shore mud. Vertical jigging producing limits of eaters.',
    technique: 'Vertical jig',
    timeOfDay: 'all day' as const,
    structureType: 'mud',
    hoursAgo: 8,
  },
  {
    lakeId: '04-0225-00',
    lakeName: 'Upper Red Lake',
    species: ['walleye'],
    lures: ['jig'],
    colors: ['gold'],
    depthFt: 6,
    waterTempF: 55,
    conditions: 'Shallow windblown shorelines. Fast action on gold jigs.',
    technique: 'Casting',
    timeOfDay: 'afternoon' as const,
    structureType: 'shoreline',
    hoursAgo: 18,
  },
  {
    lakeId: '31-0266-00',
    lakeName: 'Lake Winnibigoshish',
    species: ['walleye', 'northern_pike'],
    lures: ['crawler harness', 'spoon'],
    colors: ['perch'],
    depthFt: 14,
    waterTempF: 59,
    conditions: 'Main lake bars. Pike bycatch on harnesses.',
    technique: 'Trolling',
    timeOfDay: 'morning' as const,
    structureType: 'bar',
    hoursAgo: 36,
  },
  {
    lakeId: 'RAINY-MN',
    lakeName: 'Rainy Lake',
    species: ['smallmouth_bass'],
    lures: ['jerkbait', 'tube'],
    colors: ['silver', 'green pumpkin'],
    depthFt: 9,
    waterTempF: 57,
    conditions: 'Canadian-side rock piles. Aggressive topwater in evening.',
    technique: 'Casting',
    timeOfDay: 'evening' as const,
    structureType: 'rock pile',
    hoursAgo: 20,
  },
  {
    lakeId: '69-0375-00',
    lakeName: 'Lake Vermilion',
    species: ['muskie', 'smallmouth_bass'],
    lures: ['spinnerbait', 'topwater'],
    colors: ['white'],
    depthFt: 6,
    waterTempF: 61,
    conditions: 'Weed edges and points. Cloudy skies helped the bite.',
    technique: 'Casting',
    timeOfDay: 'afternoon' as const,
    structureType: 'weed edge',
    hoursAgo: 50,
  },
  {
    lakeId: '69-0375-00',
    lakeName: 'Lake Vermilion',
    species: ['walleye'],
    lures: ['leech', 'jig'],
    colors: ['black'],
    depthFt: 22,
    waterTempF: 56,
    conditions: 'Deep breaks adjacent to cabbage. Slow presentation.',
    technique: 'Slip bobber',
    timeOfDay: 'early morning' as const,
    structureType: 'breakline',
    hoursAgo: 4,
  },
];

async function seedReports(): Promise<void> {
  console.log(`Seeding ${DEMO_REPORTS.length} demo angler reports...`);
  const batch = db.batch();
  const lakeCounts = new Map<string, number>();

  for (const r of DEMO_REPORTS) {
    const ref = db.collection('angler_reports').doc();
    const reportDate = Timestamp.fromMillis(
      Date.now() - r.hoursAgo * 3600 * 1000
    );
    const now = Timestamp.now();

    batch.set(ref, {
      reportId: ref.id,
      lakeId: r.lakeId,
      lakeName: r.lakeName,
      sourceId: 'seed_demo',
      userId: null,
      reportDate,
      species: r.species,
      lures: r.lures,
      colors: r.colors,
      depthFt: r.depthFt,
      waterTempF: r.waterTempF,
      conditions: r.conditions,
      technique: r.technique,
      timeOfDay: r.timeOfDay,
      aiSummary: r.conditions,
      userSubmitted: false,
      isPublic: true,
      verified: true,
      upvotes: Math.floor(Math.random() * 12),
      photoUrl: null,
      rawText: r.conditions,
      confidenceScore: 85,
      structureType: r.structureType,
      createdAt: now,
      updatedAt: now,
    });

    lakeCounts.set(r.lakeId, (lakeCounts.get(r.lakeId) ?? 0) + 1);
  }

  await batch.commit();
  console.log(`✓ ${DEMO_REPORTS.length} reports written`);

  for (const [lakeId, count] of lakeCounts) {
    const latest = DEMO_REPORTS.filter((r) => r.lakeId === lakeId).sort(
      (a, b) => a.hoursAgo - b.hoursAgo
    )[0];
    await db.collection('lakes').doc(lakeId).set(
      {
        reportCount7d: FieldValue.increment(count),
        lastReportDate: Timestamp.fromMillis(
          Date.now() - (latest?.hoursAgo ?? 24) * 3600 * 1000
        ),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  }
  console.log(`✓ Updated reportCount7d / lastReportDate on ${lakeCounts.size} lakes`);
}

seedReports().catch((err) => {
  console.error('Seed reports failed:', err);
  process.exit(1);
});
