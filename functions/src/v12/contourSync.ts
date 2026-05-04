import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { FieldValue } from 'firebase-admin/firestore';

export const syncContourTiles = onSchedule(
  {
    schedule: 'every 168 hours',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (event) => {
    logger.info('Contour tile sync started', { scheduleTime: event.scheduleTime });

    const tier1Snap = await db.collection('lakes').where('tier', '==', 1).get();

    for (const lakeDoc of tier1Snap.docs) {
      const lake = lakeDoc.data() as { name?: string };
      try {
        // TODO: Phase 4 — call Navionics Web API for tile URL
        // Fall back to USGS vector tiles for Tier 2 lakes
        await db.collection('lake_contour_metadata').doc(lakeDoc.id).set(
          {
            lakeId: lakeDoc.id,
            contourSource: 'navionics',
            tier: 1,
            tileUrl: '',
            lastSynced: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        logger.error(`Failed to sync contours for ${lake.name ?? lakeDoc.id}`, { error: err });
      }
    }

    logger.info('Contour tile sync completed');
  }
);

export const contourAlertFan = onDocumentCreated(
  {
    document: 'contour_update_log/{logId}',
    region: 'us-central1',
  },
  async (event) => {
    const log = event.data?.data();
    if (!log) return;

    logger.info('Contour update log entry created', { logId: event.params.logId });

    // TODO: Phase 4 — fan out notifications to subscribers of this lake
    // using FCM via notificationDispatch trigger
  }
);
