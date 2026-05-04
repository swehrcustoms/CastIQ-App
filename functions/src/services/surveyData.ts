import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { SurveyDataRequestSchema } from '../utils/validators';

const COLLECTION_MAP: Record<string, string> = {
  netting: 'netting_surveys',
  electrofishing: 'electrofishing_surveys',
  stocking: 'stocking_events',
  creel: 'creel_surveys',
  winterkill: 'winterkill_events',
  water_quality: 'water_quality',
};

const DATE_FIELD_MAP: Record<string, string> = {
  netting: 'surveyYear',
  electrofishing: 'surveyYear',
  stocking: 'stockingDate',
  creel: 'surveyYear',
  winterkill: 'eventYear',
  water_quality: 'sampleDate',
};

export const surveyDataService = onCall(
  { region: 'us-central1', maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = SurveyDataRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { lakeId, type, limit } = parsed.data;
    const collectionName = COLLECTION_MAP[type];
    const dateField = DATE_FIELD_MAP[type];

    const snap = await db
      .collection(collectionName)
      .where('lakeId', '==', lakeId)
      .orderBy(dateField, 'desc')
      .limit(limit)
      .get();

    const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    logger.info('Survey data fetched', { lakeId, type, count: records.length });
    return { records };
  }
);
