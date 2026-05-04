import type { Timestamp } from './common';

export interface LakeContourMetadata {
  lakeId: string;
  contourSource: 'navionics' | 'usgs' | 'crowdsourced';
  tier: 1 | 2 | 3;
  tileUrl: string;
  coverageBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  lastSynced: Timestamp;
  maxDepthFt: number;
  depthContourIntervalFt: number;
}

export interface LakeStructure {
  structureId: string;
  lakeId: string;
  structureType: 'hump' | 'drop-off' | 'flat' | 'weedline' | 'point' | 'channel';
  lat: number;
  lng: number;
  depthFt: number;
  verified: boolean;
  aiDetected: boolean;
  notes: string | null;
  submittedBy: string | null;
}

export interface ContourUpdateLog {
  logId: string;
  lakeId: string;
  updateType: 'navionics_sync' | 'usgs_import' | 'sonar_upload';
  processedAt: Timestamp;
  uploadedBy: string | null;
  fileSizeMB: number | null;
  status: 'success' | 'failed' | 'processing';
}
