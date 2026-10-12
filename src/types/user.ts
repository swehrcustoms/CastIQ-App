import type { Timestamp } from './common';

export interface CastIQUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'angler' | 'guide' | 'admin';
  favoriteLakeIds: string[];
  alertPreferences: {
    species: string[];
    reportRecency: boolean;
    winterkillAlerts: boolean;
    iceReports: boolean;
  };
  submittedReportIds: string[];
  guidePortalAccess: boolean;
  /** False only for accounts created after onboarding shipped. Missing means an existing account. */
  onboardingComplete?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface AnglerReport {
  reportId: string;
  lakeId: string;
  lakeName: string;
  sourceId: string | null;
  userId: string | null;
  reportDate: Timestamp;
  species: string[];
  lures: string[];
  colors: string[];
  depthFt: number | null;
  waterTempF: number | null;
  conditions: string;
  technique: string;
  timeOfDay: 'early morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'all day';
  aiSummary: string;
  userSubmitted: boolean;
  isPublic: boolean;
  verified: boolean;
  upvotes: number;
  photoUrl: string | null;
  rawText: string;
  confidenceScore: number;
  structureType: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReportSource {
  sourceId: string;
  name: string;
  url: string;
  rssUrl: string | null;
  type: 'RSS' | 'API' | 'scrape' | 'user';
  coverage: string;
  postingFrequency: string;
  credibilityScore: number;
  lastIngested: Timestamp | null;
  active: boolean;
}

export interface GuidePortalUser {
  guideId: string;
  userId: string;
  businessName: string;
  licenseNumber: string;
  primaryLakeIds: string[];
  targetSpecies: string[];
  subscriptionTier: 'basic' | 'pro';
  apiAccessEnabled: boolean;
  apiKey: string | null;
  dashboardPreferences: Record<string, unknown>;
  createdAt: Timestamp;
}
