import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import Parser from 'rss-parser';
import { db } from '../utils/adminInit';
import { FieldValue } from 'firebase-admin/firestore';

const RSS_SOURCES = [
  {
    id: 'fishrapper',
    url: 'https://fishrapper.com/feed/',
    credibility: 85,
    coverage: 'North Central MN + LOTW',
    type: 'RSS' as const,
  },
  {
    id: 'fishingmn',
    url: 'https://fishingminnesota.com/forum/feed/',
    credibility: 75,
    coverage: 'Statewide',
    type: 'RSS' as const,
  },
  {
    id: 'lakelink',
    url: 'https://www.lake-link.com/rss/mn-fishing-reports.xml',
    credibility: 80,
    coverage: 'Statewide lake-specific',
    type: 'RSS' as const,
  },
  {
    id: 'lotwmn',
    url: 'https://lakeofthewoodsmn.com/feed/',
    credibility: 90,
    coverage: 'LOTW South Shore + Rainy River',
    type: 'RSS' as const,
  },
];

async function ingestSource(parser: Parser, source: (typeof RSS_SOURCES)[number]): Promise<number> {
  const feed = await parser.parseURL(source.url);
  const batch = db.batch();
  let count = 0;

  for (const item of feed.items.slice(0, 10)) {
    const rawText = [item.title, item.contentSnippet ?? item.content].filter(Boolean).join(' ');
    if (!rawText || rawText.length < 20) continue;

    const ref = db.collection('angler_reports').doc();
    batch.set(ref, {
      reportId: ref.id,
      lakeId: '',               // AI parser will populate this in Phase 3
      lakeName: '',
      sourceId: source.id,
      userId: null,
      reportDate: item.pubDate ? new Date(item.pubDate) : FieldValue.serverTimestamp(),
      species: [],
      lures: [],
      colors: [],
      depthFt: null,
      waterTempF: null,
      conditions: '',
      technique: '',
      timeOfDay: 'all day',
      aiSummary: '',            // AI Report Parser will fill this in Phase 3
      userSubmitted: false,
      isPublic: true,
      verified: false,
      upvotes: 0,
      photoUrl: null,
      rawText,
      confidenceScore: source.credibility,
      structureType: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    count++;
  }

  if (count > 0) await batch.commit();

  // Update source last-ingested timestamp
  await db.collection('report_sources').doc(source.id).set(
    {
      sourceId: source.id,
      name: source.id,
      url: source.url,
      rssUrl: source.url,
      type: source.type,
      coverage: source.coverage,
      postingFrequency: '4x/day',
      credibilityScore: source.credibility,
      lastIngested: FieldValue.serverTimestamp(),
      active: true,
    },
    { merge: true }
  );

  return count;
}

export const rssIngestionCron = onSchedule(
  {
    schedule: 'every 4 hours',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (event) => {
    logger.info('RSS ingestion cron started', { scheduleTime: event.scheduleTime });

    const parser = new Parser();
    let totalIngested = 0;

    for (const source of RSS_SOURCES) {
      try {
        const count = await ingestSource(parser, source);
        logger.info(`Ingested ${count} items from ${source.id}`);
        totalIngested += count;
      } catch (err) {
        logger.error(`Failed to ingest ${source.id}`, { error: String(err) });
      }
    }

    logger.info('RSS ingestion cron completed', { totalIngested });
  }
);
