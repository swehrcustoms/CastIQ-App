import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

const ALERT_COLLECTIONS = ['regulation_alerts', 'winterkill_events'];

export const notificationDispatch = onDocumentCreated(
  {
    document: '{collection}/{docId}',
    region: 'us-central1',
  },
  async (event) => {
    const collection = event.params.collection;
    if (!ALERT_COLLECTIONS.includes(collection)) return;

    const data = event.data?.data();
    if (!data) return;

    logger.info('Notification dispatch triggered', {
      collection,
      docId: event.params.docId,
    });

    // TODO: Phase 6 — send FCM push notifications to subscribed users
    // Query users.alertPreferences to find subscribers, send via admin.messaging()
  }
);
