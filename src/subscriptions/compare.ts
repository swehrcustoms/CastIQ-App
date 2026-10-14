import { PROPOSED_LIMITS } from './limits';

export interface CompareObservation {
  lakeId: string;
  lakeName: string;
  species: string;
  observedAt: number | null;
  depthFt: number | null;
  waterTempF: number | null;
  source: string | null;
}

export interface CompareResult {
  ok: boolean;
  code: 'ready' | 'too_many_lakes' | 'insufficient';
  lakes: string[];
  rows: { lakeName: string; species: string; observedAt: number | null; depth: string; water: string; source: string }[];
  ranking: null;
}

function shown(value: number | null, unit: string): string {
  return value == null ? 'Not reported' : `${value}${unit}`;
}

export function compareLakes(observations: CompareObservation[]): CompareResult {
  const lakes = [...new Set(observations.map((item) => item.lakeId))];
  if (lakes.length > PROPOSED_LIMITS.premiumCompareLakes) {
    return { ok: false, code: 'too_many_lakes', lakes, rows: [], ranking: null };
  }
  if (observations.length === 0) {
    return { ok: false, code: 'insufficient', lakes, rows: [], ranking: null };
  }
  return {
    ok: true,
    code: 'ready',
    lakes,
    ranking: null,
    rows: observations.map((item) => ({
      lakeName: item.lakeName,
      species: item.species,
      observedAt: item.observedAt,
      depth: shown(item.depthFt, ' ft'),
      water: shown(item.waterTempF, '°F'),
      source: item.source ?? 'Not reported',
    })),
  };
}

export function trendStatus(observations: { observedAt: number | null; value: number | null }[]): {
  status: 'insufficient' | 'ready';
  count: number;
  minimum: number;
} {
  const comparable = observations.filter((item) => item.observedAt != null && item.value != null);
  const minimum = PROPOSED_LIMITS.trendMinimumObservations;
  if (comparable.length < minimum) return { status: 'insufficient', count: comparable.length, minimum };
  return { status: 'ready', count: comparable.length, minimum };
}
