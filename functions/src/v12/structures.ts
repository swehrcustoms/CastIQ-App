import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { getAnthropicClient, anthropicApiKey, MODEL } from '../utils/anthropicClient';
import { FieldValue } from 'firebase-admin/firestore';
import { DetectStructuresRequestSchema } from '../utils/validators';

export const detectStructures = onCall(
  {
    region: 'us-central1',
    maxInstances: 5,
    secrets: [anthropicApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = DetectStructuresRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { lakeId, species = 'walleye', season = 'summer' } = parsed.data;

    const [lakeDoc, structureSnap] = await Promise.all([
      db.collection('lakes').doc(lakeId).get(),
      db.collection('lake_structures').where('lakeId', '==', lakeId).get(),
    ]);

    if (!lakeDoc.exists) {
      throw new HttpsError('not-found', `Lake ${lakeId} not found`);
    }

    const lake = lakeDoc.data()!;
    const structures = structureSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (structures.length === 0) {
      return { topStructures: [], generalAdvice: 'No structure data available for this lake.' };
    }

    const prompt = `
You are a professional fishing guide interpreting lake structure data for ${lake.name as string}.

Lake depth: max ${(lake.maxDepthFt as number | undefined) ?? 'unknown'} ft, avg ${(lake.avgDepthFt as number | undefined) ?? 'unknown'} ft
Detected structures:
${JSON.stringify(structures.map((s) => ({ id: s.id, type: (s as Record<string, unknown>).structureType, depth: (s as Record<string, unknown>).depthFt })))}

For target species ${species} in ${season}, identify:
1. The top 3 most promising structures and why
2. Recommended presentation at each structure
3. Time-of-day patterns for each structure

Return JSON:
{
  "topStructures": [
    { "structureId": "", "reasoning": "", "presentation": "", "bestTime": "" }
  ],
  "generalAdvice": ""
}`.trim();

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    logger.info('Structures detected', { lakeId, structureCount: structures.length });

    try {
      return JSON.parse(text);
    } catch {
      return { topStructures: [], generalAdvice: text };
    }
  }
);

export const ingestSonarUpload = onObjectFinalized(
  { region: 'us-central1' },
  async (event) => {
    const filePath = event.data.name;
    if (!filePath?.startsWith('sonar/')) return;

    const parts = filePath.split('/');
    const userId = parts[1];

    logger.info('Sonar file uploaded', { filePath, userId });

    const logRef = db.collection('contour_update_log').doc();
    await logRef.set({
      logId: logRef.id,
      lakeId: '',
      updateType: 'sonar_upload',
      processedAt: FieldValue.serverTimestamp(),
      uploadedBy: userId,
      fileSizeMB: event.data.size ? event.data.size / (1024 * 1024) : null,
      status: 'processing',
    });

    // TODO: Phase 4 — parse .gpx/.slg track, extract depth points, write to lake_structures

    await logRef.update({ status: 'success' });
    logger.info('Sonar upload processed', { logId: logRef.id });
  }
);
