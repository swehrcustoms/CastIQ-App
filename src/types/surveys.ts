import type { Timestamp } from './common';

export interface NettingSurvey {
  surveyId: string;
  lakeId: string;
  surveyDate: Timestamp;
  surveyYear: number;
  gear: string;
  netNights: number;
  species: string;
  CPUE: number;
  avgLengthIn: number;
  avgWeightLb: number;
  ageClass: string;
  totalCount: number;
  surveyType: 'standard' | 'special';
  conductedBy: string;
  aiTrendSummary: string | null;
}

export interface ElectrofishingSurvey {
  surveyId: string;
  lakeId: string;
  surveyDate: Timestamp;
  surveyYear: number;
  shockingMinutes: number;
  species: string;
  CPUE: number;
  avgLengthIn: number;
  avgWeightLb: number;
  totalCount: number;
  habitatType: 'rocky' | 'weedy' | 'mixed';
  conductedBy: string;
}

export interface CreelSurvey {
  creelId: string;
  lakeId: string;
  surveyDate: Timestamp;
  surveyYear: number;
  anglerHours: number;
  anglerCount: number;
  targetSpecies: string;
  catchPerHour: number;
  harvestPerHour: number;
  peakTime: string;
  conductedBy: string;
  fishingPressureScore: number;
}

export interface WaterQuality {
  wqId: string;
  lakeId: string;
  sampleDate: Timestamp;
  year: number;
  secchiDepthFt: number;
  pH: number;
  dissolvedO2: number;
  phosphorusMgL: number;
  turbidity: 'clear' | 'slightly turbid' | 'turbid';
  algaePresent: boolean;
  algaeType: string | null;
  waterTempF: number | null;
  testedBy: string;
}
