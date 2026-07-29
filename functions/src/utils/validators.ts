import { z } from 'zod';

export const LakeMetadataRequestSchema = z.object({
  lakeId: z.string().min(1),
});

export const GeoSearchRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMiles: z.number().positive().max(200).default(25),
  species: z.string().optional(),
  limit: z.number().int().positive().max(50).default(20),
});

export const SurveyDataRequestSchema = z.object({
  lakeId: z.string().min(1),
  type: z.enum([
    'netting',
    'electrofishing',
    'stocking',
    'creel',
    'winterkill',
    'water_quality',
  ]),
  limit: z.number().int().positive().max(100).default(10),
});

export const RegulationLookupRequestSchema = z.object({
  lakeId: z.string().min(1),
  species: z.string().optional(),
  year: z.number().int().min(2020).max(2030).optional(),
});

export const WeatherRequestSchema = z.object({
  lakeId: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
});

export const ReportAggregationRequestSchema = z.object({
  lakeId: z.string().min(1),
  limit: z.number().int().positive().max(50).default(20),
  species: z.string().optional(),
  cursor: z.string().optional(),
});

export const UserSubmissionRequestSchema = z.object({
  lakeId: z.string().min(1),
  lakeName: z.string().min(1),
  species: z.array(z.string()).min(1),
  lures: z.array(z.string()),
  colors: z.array(z.string()),
  depthFt: z.number().positive().nullable().optional(),
  waterTempF: z.number().nullable().optional(),
  conditions: z.string().max(500),
  technique: z.string().max(200),
  timeOfDay: z.enum([
    'early morning',
    'morning',
    'afternoon',
    'evening',
    'night',
    'all day',
  ]),
  structureType: z.string().nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().default(true),
});

export const AITaskSchema = z.discriminatedUnion('task', [
  z.object({
    task: z.literal('lure_recommendation'),
    payload: z.object({
      lakeId: z.string(),
      species: z.string(),
      season: z.enum(['spring', 'summer', 'fall', 'ice']),
      waterTempF: z.number(),
      pressureInHg: z.number(),
      windSpeedMph: z.number(),
      latestReports: z.array(z.string()),
      nettingSurveyCPUE: z.number(),
      lastStockDate: z.string().nullable(),
    }),
  }),
  z.object({
    task: z.literal('weekly_summary'),
    payload: z.object({
      lakeName: z.string(),
      week: z.string(),
      reports: z.array(z.string()),
      surveyHighlights: z.string().nullable(),
      weatherSummary: z.string(),
    }),
  }),
  z.object({
    task: z.literal('border_advisor'),
    payload: z.object({
      waterName: z.string(),
      mnRegText: z.string(),
      partnerJurisdiction: z.string(),
      partnerRegText: z.string(),
      targetSpecies: z.string(),
    }),
  }),
  z.object({
    task: z.literal('fisheries_trend'),
    payload: z.object({
      lakeName: z.string(),
      species: z.string(),
      nettingData: z.array(
        z.object({ year: z.number(), CPUE: z.number(), avgLengthIn: z.number() })
      ),
      stockingHistory: z.array(
        z.object({ year: z.number(), count: z.number(), lifestage: z.string() })
      ),
    }),
  }),
  z.object({
    task: z.literal('winterkill_risk'),
    payload: z.object({
      lakeName: z.string(),
      avgDepthFt: z.number(),
      dissolvedO2Readings: z.array(z.object({ date: z.string(), do: z.number() })),
      iceCoverIn: z.number(),
      snowDepthIn: z.number(),
      aerationActive: z.boolean(),
    }),
  }),
  z.object({
    task: z.literal('regulation_conflict'),
    payload: z.object({
      lakeName: z.string(),
      species: z.string(),
      regulationJson: z.string(),
    }),
  }),
]);

export const LiveIntelligenceRequestSchema = z.object({
  lakeId: z.string().min(1),
  forceRefresh: z.boolean().default(false),
});

export const DetectStructuresRequestSchema = z.object({
  lakeId: z.string().min(1),
  species: z.string().optional(),
  season: z.enum(['spring', 'summer', 'fall', 'ice']).optional(),
});

export const GuidePortalRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('get_dashboard'),
    lakeIds: z.array(z.string()).default([]),
  }),
  z.object({ action: z.literal('generate_api_key') }),
  z.object({ action: z.literal('revoke_api_key') }),
  z.object({
    action: z.literal('update_preferences'),
    preferences: z.record(z.unknown()),
  }),
]);
