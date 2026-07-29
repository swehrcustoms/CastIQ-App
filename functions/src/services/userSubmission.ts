import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { FieldValue } from 'firebase-admin/firestore';
import { UserSubmissionRequestSchema } from '../utils/validators';

export const userSubmissionService = onCall(
  { region: 'us-central1', maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const parsed = UserSubmissionRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', parsed.error.message);
    }

    const data = parsed.data;
    const userId = request.auth.uid;

    const reportRef = db.collection('angler_reports').doc();
    const now = FieldValue.serverTimestamp();

    await reportRef.set({
      reportId: reportRef.id,
      ...data,
      userId,
      userSubmitted: true,
      verified: false,
      upvotes: 0,
      aiSummary: data.conditions
        ? `Angler report: ${data.conditions.slice(0, 160)}`
        : '',
      rawText: data.conditions ?? '',
      confidenceScore: 80,
      sourceId: null,
      reportDate: now,
      createdAt: now,
      updatedAt: now,
    });

    // Update user's submitted report list + lake report activity
    await db
      .collection('users')
      .doc(userId)
      .set(
        { submittedReportIds: FieldValue.arrayUnion(reportRef.id) },
        { merge: true }
      );

    await db
      .collection('lakes')
      .doc(data.lakeId)
      .set(
        {
          lastReportDate: now,
          reportCount7d: FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true }
      );

    logger.info('User report submitted', { reportId: reportRef.id, userId });
    return { reportId: reportRef.id };
  }
);
