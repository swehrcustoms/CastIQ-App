import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db, authAdmin } from '../utils/adminInit';
import { FieldValue } from 'firebase-admin/firestore';
import { GuidePortalRequestSchema } from '../utils/validators';
import { randomBytes } from 'crypto';

function generateApiKey(): string {
  return `castiq_${randomBytes(24).toString('hex')}`;
}

export const guidePortalService = onCall(
  { region: 'us-central1', maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const guideDoc = await db
      .collection('guide_portal_users')
      .where('userId', '==', request.auth.uid)
      .limit(1)
      .get();

    if (guideDoc.empty) {
      throw new HttpsError('permission-denied', 'Guide portal access required');
    }

    const parsed = GuidePortalRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { action } = parsed.data;
    const guideRef = guideDoc.docs[0].ref;

    if (action === 'get_dashboard') {
      const { lakeIds } = parsed.data;
      const lakes = await Promise.all(
        lakeIds.slice(0, 10).map((id) => db.collection('lakes').doc(id).get())
      );
      return { lakes: lakes.map((d) => ({ id: d.id, ...d.data() })) };
    }

    if (action === 'generate_api_key') {
      const apiKey = generateApiKey();
      await guideRef.update({ apiKey, apiAccessEnabled: true });
      logger.info('API key generated', { userId: request.auth.uid });
      return { apiKey };
    }

    if (action === 'revoke_api_key') {
      await guideRef.update({ apiKey: null, apiAccessEnabled: false });
      logger.info('API key revoked', { userId: request.auth.uid });
      return { success: true };
    }

    if (action === 'update_preferences') {
      const { preferences } = parsed.data;
      await guideRef.update({
        dashboardPreferences: preferences,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { success: true };
    }

    // Set admin claim so guide can access protected data
    await authAdmin.setCustomUserClaims(request.auth.uid, { guide: true });
    return { success: true };
  }
);
