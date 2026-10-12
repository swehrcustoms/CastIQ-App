import type { Timestamp, GeoPoint } from './common';

export interface LakeCoordinates {
  lat: number;
  lng: number;
  geohash: string;
}

export interface SpeciesPresence {
  speciesId: string;
  confirmed: boolean;
  lastSurveyYear?: number;
}

export interface Lake {
  lakeId: string;
  name: string;
  lat: number;
  lng: number;
  center: GeoPoint;
  coordinates: LakeCoordinates;
  acreage: number;
  maxDepthFt: number;
  avgDepthFt: number;
  county: string;
  nearestTown?: string;
  dnrLakeNumber: string;
  jurisdiction: string;
  waterType: 'lake' | 'river' | 'reservoir';
  borderWater: boolean;
  borderStates: string[];
  AISPresent: string[];
  hasAeration: boolean;
  managementClass: string;
  lastSurveyDate: Timestamp | null;
  lastStockDate: Timestamp | null;
  speciesPresent: string[];
  speciesPresenceDetail: SpeciesPresence[];
  reportCount7d: number;
  lastReportDate: Timestamp | null;
  contourTier: 1 | 2 | 3;
  similarLakeIds: string[];
  tier: 1 | 2 | 3;
  publicAccess: boolean;
  hasContourMap: boolean;
  hasDNRData: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
