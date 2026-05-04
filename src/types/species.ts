import type { Timestamp } from './common';

export interface SpeciesRegistry {
  speciesId: string;
  commonName: string;
  scientificName: string;
  habitatType: string[];
  depthRangeMin: number;
  depthRangeMax: number;
  spawnSeason: string;
  spawnTempF: number;
  feedingPattern: string;
  preferredLures: string[];
  preferredColors: string[];
  iconUrl: string;
  seasonActivity: Record<string, string>;
}

export interface LureColor {
  lureId: string;
  lureName: string;
  lureType: string;
  brand: string | null;
  effectiveSpecies: string[];
  effectiveSeason: string[];
  effectiveDepthMin: number;
  effectiveDepthMax: number;
  topColors: string[];
  aiEffectivenessScore: number;
  reportMentionCount: number;
  lastUpdated: Timestamp;
}
