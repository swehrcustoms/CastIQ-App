import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

export const waterQualityIngestion = onSchedule(
  {
    // Run monthly (720 hours) during open-water season
    schedule: 'every 720 hours',
    region: 'us-central1',
    timeoutSeconds: 300,
    memory: '256MiB',
  },
  async (event) => {
    logger.info('Water quality ingestion started', { scheduleTime: event.scheduleTime });

    // TODO: Phase 2 — ingest MPCA Secchi depth, pH, DO, phosphorus data
    // Source: MPCA Environmental Data Access
    // Write to: water_quality collection

    logger.info('Water quality ingestion completed');
  }
);
