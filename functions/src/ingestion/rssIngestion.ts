import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { db } from '../utils/adminInit';
import { FieldValue } from 'firebase-admin/firestore';

const RSS_SOURCES = [
  { id: 'fishrapper', url: 'https://fishrapper.com/feed/', credibility: 85, coverage: 'North Central MN + LOTW' },
  { id: 'fishingmn', url: 'https://fishingminnesota.com/forum/feed/', credibility: 75, coverage: 'Statewide' },
  { id: 'lakelink', url: 'https://www.lake-link.com/rss/mn-fishing-reports.xml', credibility: 80, coverage: 'Statewide lake-specific' },
  { id: 'lotwmn', url: 'https://lakeofthewoodsmn.com/feed/', credibility: 90, coverage: 'LOTW South Shore + Rainy River' },
];

export const rssIngestionCron = onSchedule(
  {
    schedule: 'every 4 hours',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (event) => {
    logger.info('RSS ingestion cron started', { scheduleTime: event.scheduleTime });

    for (const source of RSS_SOURCES) {
      try {
        await db.collection('report_sources').doc(source.id).set(
          { lastIngested: FieldValue.serverTimestamp(), active: true },
          { merge: true }
        );
        logger.info(`Processed source: ${source.id}`);
      } catch (err) {
        logger.error(`Failed to process source ${source.id}`, { error: err });
      }
    }

    // TODO: Phase 2 — fetch RSS feeds, parse XML, call AI Report Parser, write to angler_reports

    logger.info('RSS ingestion cron completed');
  }
);
