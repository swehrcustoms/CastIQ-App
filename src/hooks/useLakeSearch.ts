import { useState, useEffect, useRef } from 'react';
import { query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Collections } from '../services/firestore';
import { compactName, nameScore, searchDnrLakes } from '../services/dnrLakeSearch';
import { canonicalSpecies, speciesMatches } from '../utils/species';
import { compareLakesByLatestReport } from '../utils/lakeSort';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export interface LakeSearchFilters {
  species?: string;
  distance?: number;
  jurisdiction?: 'inland' | 'border' | 'all';
  reportType?: 'angler' | 'dnr' | 'both';
}

export type RankedLake = WithId<Lake> & { matchScore?: number };

export interface UseLakeSearchResult {
  results: RankedLake[];
  loading: boolean;
  error: Error | null;
  approximate: boolean;
}

let knownLakesPromise: Promise<WithId<Lake>[]> | null = null;

function loadKnownLakes(): Promise<WithId<Lake>[]> {
  if (!knownLakesPromise) {
    knownLakesPromise = getDocs(query(Collections.lakes, orderBy('acreage', 'desc'), limit(80)))
      .then((snap) => snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as WithId<Lake>)))
      .catch(() => {
        knownLakesPromise = null;
        return [] as WithId<Lake>[];
      });
  }
  return knownLakesPromise;
}

function samePlace(left: WithId<Lake>, right: WithId<Lake>): boolean {
  return (
    compactName(left.name) === compactName(right.name) &&
    (left.county ?? '').trim().toLowerCase() === (right.county ?? '').trim().toLowerCase()
  );
}

function matchesSpecies(lake: WithId<Lake>, species?: string): boolean {
  if (!species) return true;
  return (lake.speciesPresent ?? []).some((item) => {
    if (speciesMatches(item, species)) return true;
    const wanted = canonicalSpecies(species);
    const present = canonicalSpecies(item);
    return wanted.endsWith('bass') && present.endsWith('bass');
  });
}

function matchesJurisdiction(lake: WithId<Lake>, jurisdiction?: LakeSearchFilters['jurisdiction']): boolean {
  if (!jurisdiction || jurisdiction === 'all') return true;
  if (jurisdiction === 'border') return lake.borderWater === true;
  return lake.borderWater !== true;
}

export function useLakeSearch(
  searchTerm: string,
  filters: LakeSearchFilters = {},
  maxResults = 20,
): UseLakeSearchResult {
  const [results, setResults] = useState<WithId<Lake>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [approximate, setApproximate] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);

    const normalized = searchTerm.trim();
    setLoading(true);
    let cancelled = false;

    debounce.current = setTimeout(async () => {
      try {
        if (!normalized) {
          const featured = await loadKnownLakes();
          if (cancelled) return;
          setResults(featured.slice(0, maxResults));
          setApproximate(false);
          setError(null);
          return;
        }

        const known = await loadKnownLakes();
        let catalog: Array<{ lake: WithId<Lake>; score: number }> = [];

        try {
          const dnr = await searchDnrLakes(normalized, maxResults);
          catalog = dnr.map((hit) => {
            const existing = known.find((lake) => samePlace(lake, hit));
            if (!existing) return { lake: hit, score: hit.matchScore };
            return {
              lake: { ...existing, nearestTown: existing.nearestTown || hit.nearestTown },
              score: hit.matchScore,
            };
          });
        } catch (err) {
          if (cancelled) return;
          setError(err instanceof Error ? err : new Error('Search failed'));
        }

        for (const lake of known) {
          if (catalog.some((item) => item.lake.id === lake.id || samePlace(item.lake, lake))) continue;
          const score = nameScore(normalized, `${lake.name} ${lake.county ?? ''}`);
          if (score <= 5) catalog.push({ lake, score });
        }

        const ranked = catalog
          .filter((item) => matchesSpecies(item.lake, filters.species) && matchesJurisdiction(item.lake, filters.jurisdiction))
          .sort((a, b) => a.score - b.score || compareLakesByLatestReport(a.lake, b.lake))
          .slice(0, maxResults);

        if (cancelled) return;
        setResults(ranked.map((item) => ({ ...item.lake, matchScore: item.score })));
        setApproximate(ranked.length > 0 && ranked[0].score > 0);
        if (catalog.length > 0 || ranked.length > 0) setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Search failed'));
        setResults([]);
        setApproximate(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [searchTerm, filters.species, filters.jurisdiction, maxResults]);

  return { results, loading, error, approximate };
}
