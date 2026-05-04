// Ingestion (scheduled)
export { rssIngestionCron } from './ingestion/rssIngestion';
export { dnrLakeFinderIngestion } from './ingestion/dnrIngestion';
export { waterQualityIngestion } from './ingestion/waterQuality';
export { iceReportIngestion } from './ingestion/iceReports';

// Data services (HTTPS callable)
export { lakeMetadataService } from './services/lakeMetadata';
export { geoSearchService } from './services/geoSearch';
export { surveyDataService } from './services/surveyData';
export { regulationLookupService } from './services/regulationLookup';
export { cacheLayer } from './services/cacheLayer';
export { reportAggregationService } from './services/reportAggregation';
export { userSubmissionService } from './services/userSubmission';

// AI functions (HTTPS callable — Anthropic API server-side)
export { aiSummarizationService } from './ai/aiSummarization';
export { liveIntelligenceService } from './ai/liveIntelligence';
export { winterkillAlertService } from './ai/winterkillAlert';

// V1.2 features
export { similarLakesIndexer } from './v12/similarLakes';
export { syncContourTiles, contourAlertFan } from './v12/contourSync';
export { detectStructures, ingestSonarUpload } from './v12/structures';
export { guidePortalService } from './v12/guidePortal';

// Background triggers
export { notificationDispatch } from './background/notifications';
