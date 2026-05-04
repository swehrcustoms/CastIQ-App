import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { ReportAggregationRequestSchema } from '../utils/validators';

export const reportAggregationService = onCall(
  { region: 'us-central1', maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = ReportAggregationRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const { lakeId, limit, species } = parsed.data;

    let q = db
      .collection('angler_reports')
      .where('lakeId', '==', lakeId)
      .where('isPublic', '==', true)
      .orderBy('reportDate', 'desc')
      .limit(limit);

    if (species) {
      q = db
        .collection('angler_reports')
        .where('lakeId', '==', lakeId)
        .where('species', 'array-contains', species)
        .where('isPublic', '==', true)
        .orderBy('reportDate', 'desc')
        .limit(limit);
    }

    const snap = await q.get();
    const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    logger.info('Reports aggregated', { lakeId, count: reports.length });
    return { reports, hasMore: reports.length === limit };
  }
);
