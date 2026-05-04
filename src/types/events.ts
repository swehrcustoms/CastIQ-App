import type { Timestamp } from './common';

export interface StockingEvent {
  stockId: string;
  lakeId: string;
  stockingDate: Timestamp;
  year: number;
  species: string;
  count: number;
  avgSizeIn: number;
  hatchery: string;
  fundingSource: 'State' | 'Federal' | 'Local';
  method: 'truck' | 'aerial';
  lifestage: 'fry' | 'fingerling' | 'yearling' | 'adult';
  purpose: 'restoration' | 'enhancement' | 'put-and-take';
}

export interface WinterkillEvent {
  killId: string;
  lakeId: string;
  eventDate: Timestamp;
  eventYear: number;
  severity: 'low' | 'moderate' | 'high' | 'complete';
  affectedSpecies: string[];
  primaryCause: string;
  minDissolvedO2: number;
  iceCoverIn: number;
  snowDepthIn: number;
  reportedBy: string;
  aerationDeployed: boolean;
  outcome: string;
}

export interface AerationEvent {
  aerationId: string;
  lakeId: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  eventDate: Timestamp;
  aerationType: 'submersible' | 'surface agitator' | 'bubbler';
  acresCovered: number;
  targetDO: number;
  preventedWinterkill: boolean | null;
  fundedBy: string;
}

export interface IceReport {
  reportId: string;
  lakeId: string;
  county: string;
  reportDate: Timestamp;
  iceTotalIn: number;
  iceBlackIn: number;
  iceWhiteIn: number;
  snowDepthIn: number;
  safetyRating: 'safe' | 'caution' | 'unsafe' | 'open water';
  accessPoints: string[];
  fishingConditions: string;
  submittedBy: string;
  userId?: string;
  verified: boolean;
}

export interface IceRoad {
  roadId: string;
  lakeId: string;
  name: string;
  openDate: Timestamp | null;
  closeDate: Timestamp | null;
  status: 'open' | 'closed' | 'seasonal';
  weightLimitLbs: number | null;
  lengthMiles: number;
  coordinates: Array<[number, number]>;
  operatedBy: string;
  lastUpdated: Timestamp;
}
