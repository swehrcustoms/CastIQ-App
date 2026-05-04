import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { LakeMetadataRequestSchema } from '../utils/validators';

export const lakeMetadataService = onCall(
  { region: 'us-central1', maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = LakeMetadataRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { lakeId } = parsed.data;

    const lakeDoc = await db.collection('lakes').doc(lakeId).get();
    if (!lakeDoc.exists) {
      throw new HttpsError('not-found', `Lake ${lakeId} not found`);
    }

    logger.info('Lake metadata fetched', { lakeId });
    return { lake: lakeDoc.data(), id: lakeDoc.id };
  }
);
