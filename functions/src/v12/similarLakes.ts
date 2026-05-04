import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { FieldValue } from 'firebase-admin/firestore';

interface LakeDoc {
  lakeId?: string;
  speciesPresent?: string[];
  avgDepthFt?: number;
  acreage?: number;
}

function computeSimilarityScore(a: LakeDoc, b: LakeDoc): number {
  let score = 0;

  const aSpecies = new Set(a.speciesPresent ?? []);
  const bSpecies = new Set(b.speciesPresent ?? []);
  const shared = [...aSpecies].filter((s) => bSpecies.has(s));
  score += (shared.length / Math.max(aSpecies.size, bSpecies.size, 1)) * 50;

  const depthDiff = Math.abs((a.avgDepthFt ?? 0) - (b.avgDepthFt ?? 0));
  score += depthDiff < 5 ? 25 : depthDiff < 15 ? 10 : 0;

  const acreageRatio = Math.min(a.acreage ?? 1, b.acreage ?? 1) /
    Math.max(a.acreage ?? 1, b.acreage ?? 1);
  score += acreageRatio > 0.5 ? 25 : acreageRatio > 0.2 ? 10 : 0;

  return Math.round(score);
}

export const similarLakesIndexer = onSchedule(
  {
    schedule: 'every 168 hours',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (event) => {
    logger.info('Similar lakes indexer started', { scheduleTime: event.scheduleTime });

    const snap = await db.collection('lakes').where('tier', '==', 1).get();
    const lakes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LakeDoc & { id: string }));

    const batch = db.batch();
    let writes = 0;

    for (const lake of lakes) {
      const scored = lakes
        .filter((other) => other.id !== lake.id)
        .map((other) => ({
          targetLakeId: other.id,
          sourceLakeId: lake.id,
          similarityScore: computeSimilarityScore(lake, other),
          sharedSpecies: (lake.speciesPresent ?? []).filter((s) =>
            (other.speciesPresent ?? []).includes(s)
          ),
          depthMatch: Math.abs((lake.avgDepthFt ?? 0) - (other.avgDepthFt ?? 0)) < 5,
          acreageRange:
            (other.acreage ?? 0) > (lake.acreage ?? 0) * 1.5
              ? 'larger'
              : (other.acreage ?? 0) < (lake.acreage ?? 0) * 0.67
                ? 'smaller'
                : 'similar',
          computedAt: FieldValue.serverTimestamp(),
        }))
        .filter((s) => s.similarityScore > 30)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10);

      for (const entry of scored) {
        const ref = db.collection('similar_lakes').doc(`${lake.id}_${entry.targetLakeId}`);
        batch.set(ref, entry, { merge: true });
        writes++;
      }
    }

    await batch.commit();
    logger.info('Similar lakes index updated', { lakeCount: lakes.length, writes });
  }
);
