import { useState, useEffect, useRef } from 'react';
import {
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAt,
  endAt,
} from 'firebase/firestore';
import { Collections } from '../services/firestore';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export interface LakeSearchFilters {
  species?: string;
  distance?: number;
  jurisdiction?: 'inland' | 'border' | 'all';
  reportType?: 'angler' | 'dnr' | 'both';
}

export interface UseLakeSearchResult {
  results: WithId<Lake>[];
  loading: boolean;
  error: Error | null;
}

export function useLakeSearch(
  searchTerm: string,
  filters: LakeSearchFilters = {},
  maxResults = 20
): UseLakeSearchResult {
  const [results, setResults] = useState<WithId<Lake>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);

    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounce.current = setTimeout(async () => {
      try {
        const normalized = searchTerm.trim();
        const end = normalized + '';

        let q = query(
          Collections.lakes,
          orderBy('name'),
          startAt(normalized),
          endAt(end),
          limit(maxResults)
        );

        // Apply species filter if provided
        if (filters.species) {
          q = query(
            Collections.lakes,
            where('speciesPresent', 'array-contains', filters.species),
            orderBy('name'),
            startAt(normalized),
            endAt(end),
            limit(maxResults)
          );
        }

        // Apply border water filter
        if (filters.jurisdiction === 'border') {
          q = query(
            Collections.lakes,
            where('borderWater', '==', true),
            orderBy('name'),
            startAt(normalized),
            endAt(end),
            limit(maxResults)
          );
        } else if (filters.jurisdiction === 'inland') {
          q = query(
            Collections.lakes,
            where('borderWater', '==', false),
            orderBy('name'),
            startAt(normalized),
            endAt(end),
            limit(maxResults)
          );
        }

        const snap = await getDocs(q);
        setResults(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as WithId<Lake>))
        );
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [searchTerm, filters.species, filters.jurisdiction, maxResults]);

  return { results, loading, error };
}
