/**
 * DNR LakeFinder ingestion script.
 * Fetches lake metadata, survey records, and stocking data for a given lake.
 *
 * Usage:
 *   FIREBASE_PROJECT_ID=castiq-app tsx scripts/ingestDNR.ts --lake 48-0259-00
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

const db = getFirestore();

const DNR_LAKEFINDER_BASE = 'https://www.dnr.state.mn.us/lakefind/lake.html';

interface LakeFinderResult {
  lakeId: string;
  name?: string;
  county?: string;
  acreage?: number;
  maxDepthFt?: number;
}

async function fetchLakeMetadata(lakeNumber: string): Promise<LakeFinderResult> {
  // TODO: Phase 2 — implement actual HTTP scrape + HTML parse
  // URL: `${DNR_LAKEFINDER_BASE}?id=${lakeNumber}`
  // Parse: lake name, county, acreage, max depth, shore miles, water clarity
  console.log(`[stub] Would fetch: ${DNR_LAKEFINDER_BASE}?id=${lakeNumber}`);
  return { lakeId: lakeNumber };
}

async function fetchSurveyData(_lakeNumber: string): Promise<unknown[]> {
  // TODO: Phase 2 — scrape netting/electrofishing survey tables from LakeFinder
  return [];
}

async function fetchStockingData(_lakeNumber: string): Promise<unknown[]> {
  // TODO: Phase 2 — scrape stocking history table from LakeFinder
  return [];
}

async function ingestLake(lakeNumber: string): Promise<void> {
  console.log(`Ingesting lake: ${lakeNumber}`);

  const [metadata, surveys, stocking] = await Promise.all([
    fetchLakeMetadata(lakeNumber),
    fetchSurveyData(lakeNumber),
    fetchStockingData(lakeNumber),
  ]);

  await db
    .collection('lakes')
    .doc(lakeNumber)
    .set(
      { ...metadata, lastIngested: Timestamp.now() },
      { merge: true }
    );

  console.log(`✓ Lake ${lakeNumber} ingested`);
  console.log(`  Surveys: ${surveys.length}, Stocking: ${stocking.length}`);
}

const args = process.argv.slice(2);
const lakeIndex = args.indexOf('--lake');
const lakeNumber = lakeIndex >= 0 ? args[lakeIndex + 1] : undefined;

if (!lakeNumber) {
  console.error('Usage: tsx scripts/ingestDNR.ts --lake <dnr-lake-number>');
  process.exit(1);
}

ingestLake(lakeNumber).catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
