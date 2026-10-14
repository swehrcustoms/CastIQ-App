import type { GeoPoint, Timestamp } from '../types/common';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

const DNR_SEARCH = 'https://maps.dnr.state.mn.us/cgi-bin/lakefinder/search.cgi';

interface DnrLakeRaw {
  id?: string;
  name?: string;
  county?: string;
  nearest_town?: string;
  pca_id?: string | null;
  border?: string;
  fishSpecies?: string[] | string;
  invasiveSpecies?: string[];
  point?: { 'epsg:4326'?: [number, number] };
  morphology?: {
    area?: number;
    max_depth?: number;
    mean_depth?: number;
  };
  resources?: { waterAccess?: number; lakeMap?: number };
  specialFishingRegs?: Array<{
    location?: string;
    regs?: Array<{ text?: string; species?: string[] }>;
  }>;
}

export interface LakeSpecialRegulation {
  species: string;
  text: string;
  location: string;
}

export type CatalogLake = WithId<Lake> & { matchScore: number };

export function compactName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(lakes|lake|rivers|river|ponds|pond|reservoir|flowage|creek|slough)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(left: string, right: string): number {
  const a = left.slice(0, 48);
  const b = right.slice(0, 48);
  const rows = Array.from({ length: a.length + 1 }, (_, index) => index);
  for (let j = 1; j <= b.length; j += 1) {
    let previous = rows[0];
    rows[0] = j;
    for (let i = 1; i <= a.length; i += 1) {
      const current = rows[i];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i] = Math.min(rows[i] + 1, rows[i - 1] + 1, previous + cost);
      previous = current;
    }
  }
  return rows[a.length];
}

export function nameScore(query: string, name: string): number {
  const q = compactName(query);
  const n = compactName(name);
  if (!q || !n) return 50;
  if (q === n) return 0;
  if (n.startsWith(q) || q.startsWith(n)) return 1;
  if (n.includes(q) || q.includes(n)) return 2;
  const qTokens = q.split(' ');
  const nTokens = n.split(' ');
  const tokenHits = qTokens.filter((token) =>
    nTokens.some((part) => part === token || part.startsWith(token) || token.startsWith(part)),
  ).length;
  const distance = levenshtein(q, n);
  if (tokenHits === qTokens.length) return 3;
  if (distance <= 2) return 4;
  if (tokenHits > 0) return 5 + (qTokens.length - tokenHits);
  return 20 + distance;
}

export function lakePlaceLabel(lake: { nearestTown?: string; county?: string }): string {
  const town = lake.nearestTown && lake.nearestTown.toLowerCase() !== 'none' ? lake.nearestTown : '';
  const county = lake.county ? `${lake.county} County` : '';
  if (town && county) return `Near ${town} · ${county}`;
  return county || town;
}

function waterTypeOf(name: string): Lake['waterType'] {
  const lower = name.toLowerCase();
  if (lower.includes('river') || lower.includes('creek')) return 'river';
  if (lower.includes('reservoir') || lower.includes('flowage') || lower.includes('pond')) return 'reservoir';
  return 'lake';
}

function displayName(name: string, waterType: Lake['waterType'], town?: string): string {
  const trimmed = name.trim();
  if (/\b(lake|river|creek|pond|reservoir|flowage|slough|bay|marsh)\b/i.test(trimmed)) return trimmed;
  const townName = town?.trim() ?? '';
  if (
    waterType === 'lake' &&
    townName &&
    compactName(townName) === compactName(trimmed) &&
    /\b(lake|river|pond)\b/i.test(townName)
  ) {
    return townName;
  }
  if (waterType === 'lake') return `Lake ${trimmed}`;
  return trimmed;
}

function formatDow(raw: Pick<DnrLakeRaw, 'id' | 'pca_id'>): string {
  if (raw.pca_id && /^\d{2}-\d{4}-\d{2}$/.test(raw.pca_id)) return raw.pca_id;
  const digits = String(raw.id ?? '').replace(/\D/g, '');
  if (digits.length === 8) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  return String(raw.id ?? '');
}

function speciesList(raw: DnrLakeRaw): string[] {
  const source = Array.isArray(raw.fishSpecies) ? raw.fishSpecies : raw.fishSpecies ? [raw.fishSpecies] : [];
  return source
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function mapDnrLake(raw: DnrLakeRaw): CatalogLake {
  const [lng, lat] = raw.point?.['epsg:4326'] ?? [0, 0];
  const official = (raw.name ?? 'Unnamed lake').trim();
  const waterType = waterTypeOf(official);
  const id = formatDow(raw);
  const border = (raw.border ?? '').trim();
  const acreage = Math.round(raw.morphology?.area ?? 0);
  const maxDepthFt = Math.round(raw.morphology?.max_depth ?? 0);
  const avgDepthFt = Math.round(raw.morphology?.mean_depth ?? 0);

  return {
    id,
    lakeId: id,
    name: displayName(official, waterType, raw.nearest_town),
    lat,
    lng,
    center: null as unknown as GeoPoint,
    coordinates: { lat, lng, geohash: '' },
    acreage,
    maxDepthFt,
    avgDepthFt,
    county: raw.county?.trim() || 'Unknown',
    nearestTown: raw.nearest_town?.trim() || '',
    dnrLakeNumber: id,
    jurisdiction: border ? `MN/${border}` : 'MN',
    waterType,
    borderWater: Boolean(border),
    borderStates: border ? [border.toUpperCase()] : [],
    AISPresent: raw.invasiveSpecies ?? [],
    hasAeration: false,
    managementClass: '',
    lastSurveyDate: null,
    lastStockDate: null,
    speciesPresent: speciesList(raw),
    speciesPresenceDetail: [],
    reportCount7d: 0,
    lastReportDate: null,
    contourTier: 3,
    similarLakeIds: [],
    tier: 3,
    publicAccess: raw.resources?.waterAccess === 1,
    hasContourMap: raw.resources?.lakeMap === 1,
    hasDNRData: true,
    createdAt: null as unknown as Timestamp,
    updatedAt: null as unknown as Timestamp,
    matchScore: 0,
  };
}

async function fetchDnr(params: Record<string, string>): Promise<DnrLakeRaw[]> {
  const url = `${DNR_SEARCH}?${new URLSearchParams({ context: 'desktop', ...params })}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Lake search is unavailable right now.');
  const data = (await response.json()) as { results?: DnrLakeRaw[] };
  return Array.isArray(data.results) ? data.results : [];
}

export async function searchDnrLakes(term: string, maxResults = 20): Promise<CatalogLake[]> {
  const cleaned = term.trim();
  if (cleaned.length < 2) return [];

  let hits = await fetchDnr({ name: cleaned });
  let broadened = false;

  if (hits.length === 0) {
    const withoutLake = cleaned.replace(/^\s*lake\s+/i, '').trim();
    if (withoutLake && withoutLake.toLowerCase() !== cleaned.toLowerCase()) {
      hits = await fetchDnr({ name: withoutLake });
    }
  }

  if (hits.length === 0) {
    const stemSource = cleaned.replace(/^\s*lake\s+/i, '').trim();
    for (let length = stemSource.length - 1; length >= 4; length -= 1) {
      hits = await fetchDnr({ name: stemSource.slice(0, length) });
      if (hits.length > 0) {
        broadened = true;
        break;
      }
    }
  }

  const ranked = hits
    .map((hit) => {
      const lake = mapDnrLake(hit);
      lake.matchScore = nameScore(cleaned, lake.name);
      return lake;
    })
    .sort((a, b) => a.matchScore - b.matchScore || (b.acreage ?? 0) - (a.acreage ?? 0));

  const closest = broadened
    ? ranked.filter((lake) => lake.matchScore <= Math.max(ranked[0]?.matchScore ?? 4, 4) + 2)
    : ranked;

  return closest.slice(0, maxResults);
}

export async function fetchDnrLake(lakeId: string): Promise<WithId<Lake> | null> {
  const digits = lakeId.replace(/\D/g, '');
  if (digits.length < 6) return null;
  const hits = await fetchDnr({ id: digits });
  const match = hits.find((hit) => formatDow(hit) === lakeId) ?? hits[0];
  if (!match) return null;
  const lake = mapDnrLake(match);
  return { ...lake, id: lakeId, lakeId };
}

function plainRegulationText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|div|h\d|ul|ol)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function specialRegulationsFrom(raw: DnrLakeRaw | undefined): LakeSpecialRegulation[] {
  if (!raw) return [];
  return (raw.specialFishingRegs ?? []).flatMap((group) =>
    (group.regs ?? [])
      .map((reg) => ({
        species: (reg.species ?? []).filter(Boolean).join(', ') || 'All species',
        text: plainRegulationText(reg.text ?? ''),
        location: plainRegulationText(group.location ?? ''),
      }))
      .filter((reg) => reg.text),
  );
}

export function pickRegulationHit<T extends Pick<DnrLakeRaw, 'id' | 'name' | 'county' | 'pca_id'>>(
  hits: T[],
  lake: { id: string; name: string; county?: string },
): T | null {
  const name = compactName(lake.name);
  const county = (lake.county ?? '').trim().toLowerCase();
  const named = hits.filter((hit) => compactName(hit.name ?? '') === name);
  if (county) {
    const sameCounty = named.find((hit) => (hit.county ?? '').trim().toLowerCase() === county);
    if (sameCounty) return sameCounty;
  }
  const sameWater = named.find((hit) => formatDow(hit) === lake.id);
  if (sameWater) return sameWater;
  if (named.length === 1) return named[0];
  return null;
}

export async function fetchDnrSpecialRegulations(lake: {
  id: string;
  name: string;
  county?: string;
}): Promise<LakeSpecialRegulation[]> {
  const digits = lake.id.replace(/\D/g, '');
  if (digits.length >= 6) {
    const byId = pickRegulationHit(await fetchDnr({ id: digits }), lake);
    if (byId) return specialRegulationsFrom(byId);
  }

  const queryName = lake.name.replace(/^\s*lake\s+/i, '').trim() || lake.name;
  const byName = pickRegulationHit(await fetchDnr({ name: queryName }), lake);
  return specialRegulationsFrom(byName ?? undefined);
}
