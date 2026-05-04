import type { Timestamp } from './common';

export interface Regulation {
  regId: string;
  lakeId: string;
  lakeIdDNR: string;
  county: string;
  year: number;
  effectiveYear: number;
  species: string;
  jurisdiction: string;
  openDate: string;
  closeDate: string | null;
  dailyLimit: number | null;
  possessionLimit: number | null;
  conservationLicenseLimit: number | null;
  minSizeIn: number | null;
  maxSizeIn: number | null;
  slotLimitLowIn: number | null;
  slotLimitHighIn: number | null;
  gearRestrictions: string | null;
  artificialOnly: boolean;
  catchAndReleaseOnly: boolean;
  tribalOverlap: boolean;
  tribalNotes: string | null;
  experimentalReg: boolean;
  specialNotes: string | null;
  alertLevel: 'warning' | 'info' | null;
  sourceUrl: string;
}

export interface StatewideDefault {
  defaultId: string;
  species: string;
  year: number;
  zone: 'North' | 'South' | 'Metro' | null;
  openDate: string;
  closeDate: string | null;
  dailyLimit: number | null;
  minSizeIn: number | null;
  slotLimitLowIn: number | null;
  slotLimitHighIn: number | null;
  gearNotes: string | null;
  lastUpdated: Timestamp;
}

export interface RegulationAlert {
  alertId: string;
  lakeId: string | null;
  species: string | null;
  alertType: 'special' | 'experimental' | 'tribal' | 'border' | 'emergency';
  severity: 'warning' | 'info' | 'critical';
  title: string;
  body: string;
  effectiveDate: string;
  expirationDate: string | null;
  sourceUrl: string;
  createdAt: Timestamp;
}

export interface BorderWater {
  borderId: string;
  waterName: string;
  jurisdictions: string[];
  mnRegRef: string;
  partnerRegText: string;
  mnDailyLimit: Record<string, number>;
  partnerDailyLimit: Record<string, number>;
  mnMinSizeIn: Record<string, number>;
  partnerMinSizeIn: Record<string, number>;
  licenseRequired: string[];
  treatyNotes: string | null;
  conflictFlags: string[];
  aiConflictSummary: string;
  lastUpdated: Timestamp;
}
