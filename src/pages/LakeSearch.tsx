import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import { SearchFilters } from '../components/search/SearchFilters';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useLakeSearch } from '../hooks/useLakeSearch';
import type { LakeSearchFilters } from '../hooks/useLakeSearch';
import { useSearchReportRecency } from '../hooks/useSearchReportRecency';
import { compareSearchLakes, lakeWithReportRecency } from '../utils/lakeSort';

export function LakeSearch() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [filters, setFilters] = useState<LakeSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { results, loading, approximate } = useLakeSearch(query, filters);
  const recency = useSearchReportRecency(results.map((lake) => lake.id));

  // Sync URL query param
  useEffect(() => {
    if (query) {
      setParams({ q: query }, { replace: true });
    } else {
      setParams({}, { replace: true });
    }
  }, [query, setParams]);

  const sorted = results
    .map((lake) => lakeWithReportRecency(lake, recency))
    .sort(compareSearchLakes);

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

        <p className="text-xs text-castiq-muted">
          {loading
            ? query
              ? 'Searching…'
              : 'Loading lakes…'
            : query
              ? results.length === 0
                ? 'No matching lakes'
                : approximate
                  ? `${results.length} closest name${results.length !== 1 ? 's' : ''}`
                  : `${results.length} lake${results.length !== 1 ? 's' : ''} found`
              : results.length > 0
                ? 'Newest reports first'
                : 'No lakes loaded yet'}
        </p>
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
              Try a shorter spelling. Matches show the nearby town and county so you can pick the right water.
            </p>
          </div>
        )}

        {!loading && !query && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">🌊</span>
            <p className="font-medium text-castiq-white">No lakes to show yet</p>
            <p className="text-sm text-castiq-muted">
              The lake list has not been loaded into CastIQ. Search will work once those waters are available.
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
