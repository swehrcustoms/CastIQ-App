import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { getAnthropicClient, anthropicApiKey, MODEL } from '../utils/anthropicClient';
import { FieldValue } from 'firebase-admin/firestore';

const DO_CRITICAL_THRESHOLD = 2.0;
const DO_WARNING_THRESHOLD = 4.0;

export const winterkillAlertService = onCall(
  {
    region: 'us-central1',
    maxInstances: 5,
    secrets: [anthropicApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { lakeId } = request.data as { lakeId?: string };
    if (!lakeId || typeof lakeId !== 'string') {
      throw new HttpsError('invalid-argument', 'lakeId is required');
    }

    const [lakeDoc, wqSnap] = await Promise.all([
      db.collection('lakes').doc(lakeId).get(),
      db
        .collection('water_quality')
        .where('lakeId', '==', lakeId)
        .orderBy('sampleDate', 'desc')
        .limit(5)
        .get(),
    ]);

    if (!lakeDoc.exists) {
      throw new HttpsError('not-found', `Lake ${lakeId} not found`);
    }

    const lake = lakeDoc.data()!;
    const readings = wqSnap.docs.map((d) => {
      const data = d.data() as { dissolvedO2?: number; sampleDate?: { toDate?: () => Date } };
      return {
        do: data.dissolvedO2 ?? 0,
        date: data.sampleDate?.toDate?.()?.toISOString() ?? 'unknown',
      };
    });

    if (readings.length === 0) {
      return { riskLevel: 'unknown', message: 'No DO readings available' };
    }

    const latestDO = readings[0].do;
    const severity =
      latestDO < DO_CRITICAL_THRESHOLD
        ? 'critical'
        : latestDO < DO_WARNING_THRESHOLD
          ? 'moderate'
          : 'low';

    if (severity !== 'low') {
      const prompt = `
Assess winterkill risk for ${lake.name as string} based on the following data:
Lake avg depth: ${(lake.avgDepthFt as number | undefined) ?? 'unknown'} ft
Dissolved oxygen readings (most recent first):
${JSON.stringify(readings)}
Return JSON: { "riskLevel": "...", "riskScore": 0, "primaryRiskFactor": "", "recommendation": "", "estimatedDaysToThreshold": null }`.trim();

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

      if (severity === 'critical') {
        await db.collection('regulation_alerts').add({
          lakeId,
          species: null,
          alertType: 'emergency',
          severity: 'critical',
          title: `Winterkill Risk: ${lake.name as string}`,
          body: `Dissolved oxygen at ${latestDO} mg/L — below critical threshold. ${text}`,
          effectiveDate: new Date().toISOString().slice(0, 10),
          expirationDate: null,
          sourceUrl: '',
          createdAt: FieldValue.serverTimestamp(),
        });
        logger.warn('Winterkill critical alert created', { lakeId, latestDO });
      }

      return { riskLevel: severity, latestDO, aiAssessment: text };
    }

    logger.info('Winterkill check passed', { lakeId, latestDO });
    return { riskLevel: 'low', latestDO };
  }
);
