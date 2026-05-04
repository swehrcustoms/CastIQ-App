import { collection } from 'firebase/firestore';
import type { CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import type { Lake } from '../types/lake';
import type { NettingSurvey, ElectrofishingSurvey, CreelSurvey, WaterQuality } from '../types/surveys';
import type { StockingEvent, WinterkillEvent, AerationEvent, IceReport, IceRoad } from '../types/events';
import type { Regulation, StatewideDefault, RegulationAlert, BorderWater } from '../types/regulations';
import type { SpeciesRegistry, LureColor } from '../types/species';
import type { CastIQUser, AnglerReport, ReportSource, GuidePortalUser } from '../types/user';
import type { WeatherCache, LiveIntelligenceCache, SimilarLake } from '../types/cache';
import type { LakeContourMetadata, LakeStructure, ContourUpdateLog } from '../types/contours';

function typedCollection<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

export const Collections = {
  lakes: typedCollection<Lake>('lakes'),
  anglerReports: typedCollection<AnglerReport>('angler_reports'),
  nettingSurveys: typedCollection<NettingSurvey>('netting_surveys'),
  electrofishingSurveys: typedCollection<ElectrofishingSurvey>('electrofishing_surveys'),
  stockingEvents: typedCollection<StockingEvent>('stocking_events'),
  winterkillEvents: typedCollection<WinterkillEvent>('winterkill_events'),
  waterQuality: typedCollection<WaterQuality>('water_quality'),
  creelSurveys: typedCollection<CreelSurvey>('creel_surveys'),
  aerationEvents: typedCollection<AerationEvent>('aeration_events'),
  regulations: typedCollection<Regulation>('regulations'),
  statewideDefaults: typedCollection<StatewideDefault>('statewide_defaults'),
  regulationAlerts: typedCollection<RegulationAlert>('regulation_alerts'),
  borderWaters: typedCollection<BorderWater>('border_waters'),
  speciesRegistry: typedCollection<SpeciesRegistry>('species_registry'),
  luresColors: typedCollection<LureColor>('lures_colors'),
  users: typedCollection<CastIQUser>('users'),
  reportSources: typedCollection<ReportSource>('report_sources'),
  weatherCache: typedCollection<WeatherCache>('weather_cache'),
  liveIntelligenceCache: typedCollection<LiveIntelligenceCache>('live_intelligence_cache'),
  similarLakes: typedCollection<SimilarLake>('similar_lakes'),
  iceReports: typedCollection<IceReport>('ice_reports'),
  iceRoads: typedCollection<IceRoad>('ice_roads'),
  lakeContourMetadata: typedCollection<LakeContourMetadata>('lake_contour_metadata'),
  lakeStructures: typedCollection<LakeStructure>('lake_structures'),
  contourUpdateLog: typedCollection<ContourUpdateLog>('contour_update_log'),
  guidePortalUsers: typedCollection<GuidePortalUser>('guide_portal_users'),
} as const;
