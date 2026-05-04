import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

export const iceReportIngestion = onSchedule(
  {
    // Every 2 hours November through March
    schedule: 'every 2 hours',
    region: 'us-central1',
    timeoutSeconds: 300,
    memory: '256MiB',
  },
  async (event) => {
    logger.info('Ice report ingestion started', { scheduleTime: event.scheduleTime });

    const month = new Date().getMonth() + 1;
    const isIceSeason = month >= 11 || month <= 3;

    if (!isIceSeason) {
      logger.info('Outside ice season — skipping');
      return;
    }

    // TODO: Phase 5 — ingest DNR Thursday ice updates + ice road status
    // Write to: ice_reports and ice_roads collections

    logger.info('Ice report ingestion completed');
  }
);
