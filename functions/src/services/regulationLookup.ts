import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { RegulationLookupRequestSchema } from '../utils/validators';

export const regulationLookupService = onCall(
  { region: 'us-central1', maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = RegulationLookupRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { lakeId, species, year = new Date().getFullYear() } = parsed.data;

    let q = db
      .collection('regulations')
      .where('lakeId', '==', lakeId)
      .where('effectiveYear', '==', year)
      .orderBy('species');

    if (species) {
      q = db
        .collection('regulations')
        .where('lakeId', '==', lakeId)
        .where('effectiveYear', '==', year)
        .where('species', '==', species);
    }

    const [regsSnap, alertsSnap] = await Promise.all([
      q.get(),
      db
        .collection('regulation_alerts')
        .where('lakeId', '==', lakeId)
        .get(),
    ]);

    const regulations = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const alerts = alertsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    logger.info('Regulations fetched', { lakeId, species, year, count: regulations.length });
    return { regulations, alerts };
  }
);
