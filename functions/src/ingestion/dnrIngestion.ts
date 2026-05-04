import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { FieldValue } from 'firebase-admin/firestore';

const DNR_LAKEFINDER_BASE = 'https://www.dnr.state.mn.us/lakefind/lake.html';

export const dnrLakeFinderIngestion = onSchedule(
  {
    schedule: 'every 168 hours',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (event) => {
    logger.info('DNR LakeFinder ingestion started', { scheduleTime: event.scheduleTime });

    // TODO: Phase 2 — scrape DNR LakeFinder for lake metadata, surveys, stocking records
    // Base URL: ${DNR_LAKEFINDER_BASE}?id={dnrLakeNumber}
    // Triage Tier 1 lakes first, then expand

    await db.collection('lakes').doc('_ingestion_log').set(
      { lastAttempt: FieldValue.serverTimestamp(), source: 'dnr_lakefinder' },
      { merge: true }
    );

    logger.info('DNR LakeFinder ingestion completed');
    void DNR_LAKEFINDER_BASE; // referenced for future use
  }
);
