import type { Timestamp } from './common';

export interface WeatherCache {
  cacheId: string;
  lakeId: string;
  fetchedAt: Timestamp;
  waterTempF: number;
  airTempF: number;
  windSpeedMph: number;
  windDirection: string;
  pressureInHg: number;
  precipitationIn: number;
  cloudCover: number;
  uvIndex: number;
  ttl: Timestamp;
}

export interface LiveIntelligenceCache {
  cacheId: string;
  lakeId: string;
  fetchedAt: Timestamp;
  generatedAt: Timestamp;
  sources: string[];
  rawReports: string[];
  aiSynthesis: string;
  confidenceScore: number;
  topSpecies: string[];
  topLures: string[];
  conditions: string;
  ttl: Timestamp;
}

export interface SimilarLake {
  sourceLakeId: string;
  targetLakeId: string;
  similarityScore: number;
  sharedSpecies: string[];
  depthMatch: boolean;
  acreageRange: 'similar' | 'larger' | 'smaller';
  computedAt: Timestamp;
}
