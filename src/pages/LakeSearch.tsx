import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import { SearchFilters } from '../components/search/SearchFilters';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useLakeSearch } from '../hooks/useLakeSearch';
import type { LakeSearchFilters } from '../hooks/useLakeSearch';

type SortKey = 'recent' | 'nearest' | 'reports';

export function LakeSearch() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [filters, setFilters] = useState<LakeSearchFilters>({});
  const [sortKey] = useState<SortKey>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const { results, loading } = useLakeSearch(query, filters);

  // Sync URL query param
  useEffect(() => {
    if (query) {
      setParams({ q: query }, { replace: true });
    } else {
      setParams({}, { replace: true });
    }
  }, [query, setParams]);

  const sorted = [...results].sort((a, b) => {
    if (sortKey === 'reports') return (b.reportCount7d ?? 0) - (a.reportCount7d ?? 0);
    const aDate = a.lastReportDate
      ? (a.lastReportDate as unknown as { toDate?: () => Date }).toDate?.()?.getTime() ?? 0
      : 0;
    const bDate = b.lastReportDate
      ? (b.lastReportDate as unknown as { toDate?: () => Date }).toDate?.()?.getTime() ?? 0
      : 0;
    return bDate - aDate;
  });

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col bg-castiq-blue-dark">
      {/* Header */}
      <div className="border-b border-castiq-blue px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <SearchBar value={query} onChange={setQuery} autoFocus placeholder="Search lakes, rivers…" />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`shrink-0 rounded-lg px-4 py-3 text-sm transition-colors ${
              showFilters
                ? 'bg-castiq-teal text-castiq-blue-dark'
                : 'bg-castiq-blue text-castiq-muted hover:text-castiq-white'
            }`}
          >
            Filters
          </button>
        </div>

        {showFilters && (
          <SearchFilters filters={filters} onChange={setFilters} />
        )}

        {/* Result count */}
        {query && (
          <p className="text-xs text-castiq-muted">
            {loading ? 'Searching…' : `${results.length} lake${results.length !== 1 ? 's' : ''} found`}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">🔍</span>
            <p className="font-medium text-castiq-white">No lakes found</p>
            <p className="text-sm text-castiq-muted">
              Try a different name or seed the database with{' '}
              <code className="text-castiq-teal">npm run seed:lakes</code>
            </p>
          </div>
        )}

        {!loading && !query && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">🌊</span>
            <p className="font-medium text-castiq-white">Search Minnesota Lakes</p>
            <p className="text-sm text-castiq-muted">
              Type a lake name to search 4,500+ Minnesota lakes
            </p>
          </div>
        )}

        {sorted.map((lake) => (
          <SearchResultCard key={lake.id} lake={lake} />
        ))}
      </div>
    </div>
  );
}
