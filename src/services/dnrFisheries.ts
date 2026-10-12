import { compactName } from './dnrLakeSearch';
import type { ElectrofishingSurvey, NettingSurvey } from '../types/surveys';
import type { WithId } from '../types/common';

const DNR_SEARCH = 'https://maps.dnr.state.mn.us/cgi-bin/lakefinder/search.cgi';
const DNR_DETAIL = 'https://maps.dnr.state.mn.us/cgi-bin/lakefinder/detail.cgi';

const SPECIES_NAMES: Record<string, string> = {
  WAE: 'walleye',
  SAR: 'sauger',
  SAU: 'sauger',
  NOP: 'northern pike',
  MUE: 'muskie',
  LMB: 'largemouth bass',
  SMB: 'smallmouth bass',
  YEP: 'yellow perch',
  BLC: 'black crappie',
  WHC: 'white crappie',
  BLG: 'bluegill',
  PMK: 'pumpkinseed',
  HSF: 'hybrid sunfish',
  GSF: 'green sunfish',
  TLC: 'tullibee',
  CIS: 'cisco',
  LKW: 'lake whitefish',
  LAT: 'lake trout',
  BKT: 'brook trout',
  BNT: 'brown trout',
  RBT: 'rainbow trout',
  SPL: 'splake',
  YEB: 'yellow bullhead',
  BRB: 'brown bullhead',
  BLB: 'black bullhead',
  BUB: 'burbot',
  WTS: 'white sucker',
  SHR: 'shorthead redhorse',
  RKB: 'rock bass',
  BOF: 'bowfin',
  CCF: 'channel catfish',
  FCF: 'flathead catfish',
  CAP: 'common carp',
  MUEH: 'tiger muskie',
  FHM: 'fathead minnow',
  MMS: 'mimic shiner',
  BNM: 'bluntnose minnow',
  EMS: 'emerald shiner',
  SPO: 'spottail shiner',
  SFS: 'spotfin shiner',
  GOS: 'golden shiner',
  CSH: 'common shiner',
  TPM: 'trout-perch',
  TRP: 'trout-perch',
  LGP: 'logperch',
  IOD: 'Iowa darter',
  JND: 'Johnny darter',
  NRD: 'northern redbelly dace',
  BNS: 'blacknose shiner',
  SDS: 'sand shiner',
  SHI: 'spottail shiner',
  CNM: 'central mudminnow',
  LND: 'longnose dace',
  BST: 'brook stickleback',
  BKF: 'banded killifish',
  MTS: 'mottled sculpin',
};

interface DnrCatch {
  species?: string;
  gear?: string;
  CPUE?: string | number;
  totalCatch?: string | number;
  averageWeight?: string | number;
  gearCount?: string | number;
}

interface DnrSurvey {
  surveyDate?: string;
  surveyType?: string;
  surveySubType?: string;
  surveyID?: string | number;
  narrative?: string;
  lengths?: Record<string, { fishCount?: Array<[number, number]> }>;
  fishCatchSummaries?: DnrCatch[];
}

interface DnrSearchHit {
  id?: string;
  name?: string;
  county?: string;
  morphology?: { area?: number };
}

export interface DnrAgencyProfile {
  dnrId: string;
  reportUrl: string;
  surveyDate: string | null;
  narrative: string | null;
  waterClarityFt: number | null;
  waterClarityDate: string | null;
  netting: WithId<NettingSurvey>[];
  electro: WithId<ElectrofishingSurvey>[];
}

function numberOf(value: string | number | undefined): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function plainText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function speciesName(code: string): string {
  return SPECIES_NAMES[code.toUpperCase()] ?? code;
}

function averageLength(lengths: DnrSurvey['lengths'], code: string): number {
  const counts = lengths?.[code]?.fishCount ?? [];
  let fish = 0;
  let total = 0;
  for (const pair of counts) {
    const length = Number(pair?.[0]);
    const count = Number(pair?.[1]);
    if (!Number.isFinite(length) || !Number.isFinite(count) || count <= 0) continue;
    fish += count;
    total += length * count;
  }
  if (fish === 0) return 0;
  return Math.round((total / fish) * 10) / 10;
}

function stamp(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return {
    seconds: Math.floor(date.getTime() / 1000),
    toDate: () => date,
  };
}

function isAssessmentGear(gear: string): boolean {
  const value = gear.toLowerCase();
  return value.includes('gill') || value.includes('trap') || value.includes('electro');
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Minnesota DNR data is unavailable right now.');
  return response.json() as Promise<T>;
}

async function searchLakes(params: Record<string, string>): Promise<DnrSearchHit[]> {
  const url = `${DNR_SEARCH}?${new URLSearchParams({ context: 'desktop', ...params })}`;
  const data = await fetchJson<{ results?: DnrSearchHit[] }>(url);
  return Array.isArray(data.results) ? data.results : [];
}

export async function resolveDnrLakeId(lake: {
  id: string;
  name?: string;
  county?: string;
}): Promise<string | null> {
  const digits = lake.id.replace(/\D/g, '');
  const wantedName = compactName(lake.name ?? '');
  const wantedCounty = (lake.county ?? '').trim().toLowerCase();

  if (digits.length === 8 && wantedName) {
    const hits = await searchLakes({ id: digits });
    const hit = hits[0];
    const sameName = hit && compactName(hit.name ?? '') === wantedName;
    const sameCounty = !wantedCounty || (hit?.county ?? '').trim().toLowerCase() === wantedCounty;
    if (sameName && sameCounty) return digits;
  }

  if (!wantedName) return digits.length === 8 ? digits : null;

  const hits = await searchLakes({ name: lake.name ?? '' });
  const named = hits.filter((hit) => {
    const name = compactName(hit.name ?? '');
    return name === wantedName || name.startsWith(wantedName);
  });
  const countyMatches = named.filter((hit) => (hit.county ?? '').trim().toLowerCase() === wantedCounty);
  const pool = (countyMatches.length > 0 ? countyMatches : named).slice().sort((a, b) => {
    return (b.morphology?.area ?? 0) - (a.morphology?.area ?? 0);
  });
  const wholeLake = pool.find((hit) => String(hit.id ?? '').endsWith('00')) ?? pool[0];
  return wholeLake?.id ?? (digits.length === 8 ? digits : null);
}

export async function fetchDnrFisheries(lake: {
  id: string;
  name?: string;
  county?: string;
}): Promise<DnrAgencyProfile | null> {
  const dnrId = await resolveDnrLakeId(lake);
  if (!dnrId) return null;

  const url = `${DNR_DETAIL}?${new URLSearchParams({ type: 'lake_survey', id: dnrId })}`;
  const data = await fetchJson<{
    status?: string;
    result?: {
      surveys?: DnrSurvey[];
      waterClarity?: Array<[string, string]>;
    } | null;
  }>(url);
  const result = data.result;
  if (!result || data.status === 'ERROR') return null;

  const surveys = [...(result.surveys ?? [])].sort((a, b) => (b.surveyDate ?? '').localeCompare(a.surveyDate ?? ''));
  const netting: WithId<NettingSurvey>[] = [];
  const electro: WithId<ElectrofishingSurvey>[] = [];

  for (const survey of surveys) {
    const surveyDate = survey.surveyDate ?? '';
    const year = Number.parseInt(surveyDate.slice(0, 4), 10);
    if (!surveyDate || !Number.isFinite(year)) continue;
    const catches = survey.fishCatchSummaries ?? [];
    const assessment = catches.filter((row) => isAssessmentGear(row.gear ?? ''));
    const rows = assessment.length > 0 ? assessment : catches;

    for (const row of rows) {
      const code = (row.species ?? '').trim();
      const gear = (row.gear ?? 'Survey gear').trim();
      if (!code) continue;
      const species = speciesName(code);
      const id = `${dnrId}-${survey.surveyID ?? surveyDate}-${code}-${gear.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const shared = {
        surveyId: String(survey.surveyID ?? surveyDate),
        lakeId: lake.id,
        surveyDate: stamp(surveyDate) as NettingSurvey['surveyDate'],
        surveyYear: year,
        species,
        CPUE: numberOf(row.CPUE),
        avgLengthIn: averageLength(survey.lengths, code),
        avgWeightLb: numberOf(row.averageWeight),
        totalCount: Math.round(numberOf(row.totalCatch)),
        conductedBy: 'Minnesota DNR',
      };

      if (gear.toLowerCase().includes('electro')) {
        electro.push({
          id,
          ...shared,
          shockingMinutes: Math.round(numberOf(row.gearCount)),
          habitatType: 'mixed',
        });
      } else {
        netting.push({
          id,
          ...shared,
          gear,
          netNights: Math.round(numberOf(row.gearCount)),
          ageClass: '',
          surveyType: (survey.surveyType ?? '').toLowerCase().includes('standard') ? 'standard' : 'special',
          aiTrendSummary: null,
        });
      }
    }
  }

  const latestNarrative = surveys
    .map((survey) => plainText(survey.narrative ?? ''))
    .find((text) => text.length > 0) ?? null;

  const clarity = [...(result.waterClarity ?? [])]
    .map((pair) => ({
      date: pair?.[0] ?? '',
      feet: numberOf(pair?.[1]),
    }))
    .filter((row) => row.feet > 0 && row.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return {
    dnrId,
    reportUrl: `https://www.dnr.state.mn.us/lakefind/lake.html?id=${dnrId}`,
    surveyDate: surveys[0]?.surveyDate ?? null,
    narrative: latestNarrative,
    waterClarityFt: clarity?.feet ?? null,
    waterClarityDate: clarity?.date ?? null,
    netting,
    electro,
  };
}
