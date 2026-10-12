import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, limit, orderBy, query } from 'firebase/firestore';
import { MapView } from '../components/map/MapView';
import { SpeciesChips, SPECIES_OPTIONS } from '../components/shared/SpeciesChips';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { SearchBar } from '../components/search/SearchBar';
import { Collections } from '../services/firestore';
import { formatReportAge, getPinColor } from '../utils/reportRecencyColor';
import { canonicalSpecies, speciesMatches } from '../utils/species';
import { useGeolocation, MN_CENTER } from '../hooks/useGeolocation';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

function lakeMatchesSpecies(lake: WithId<Lake>, selected: string): boolean {
  if (selected === 'all') return true;
  return (lake.speciesPresent ?? []).some((species) => {
    if (speciesMatches(species, selected)) return true;
    const wanted = canonicalSpecies(selected);
    const present = canonicalSpecies(species);
    return wanted.endsWith('bass') && present.endsWith('bass');
  });
}

export function MapHome() {
  const navigate = useNavigate();
  const { location, loading: geoLoading } = useGeolocation();
  const [nearbyLakes, setNearbyLakes] = useState<WithId<Lake>[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lakesLoading, setLakesLoading] = useState(false);
  const [selectedLake, setSelectedLake] = useState<WithId<Lake> | null>(null);

  const center = location ?? MN_CENTER;

  const fetchNearby = useCallback(async () => {
    setLakesLoading(true);
    setSelectedLake(null);
    try {
      const snap = await getDocs(query(Collections.lakes, orderBy('acreage', 'desc'), limit(40)));
      const lakes = snap.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as WithId<Lake>))
        .filter((lake) => lakeMatchesSpecies(lake, selectedSpecies))
        .sort((a, b) => (b.reportCount7d ?? 0) - (a.reportCount7d ?? 0) || (b.acreage ?? 0) - (a.acreage ?? 0));
      setNearbyLakes(lakes);
    } catch {
      setNearbyLakes([]);
    } finally {
      setLakesLoading(false);
    }
  }, [selectedSpecies]);

  useEffect(() => {
    if (!geoLoading) fetchNearby();
  }, [fetchNearby, geoLoading]);

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col overflow-hidden bg-castiq-blue-dark">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 pt-safe">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v);
              if (v.length > 1) navigate(`/search?q=${encodeURIComponent(v)}`);
            }}
            placeholder="Search lakes…"
          />
        </div>
        <button
          onClick={() => navigate('/search')}
          className="shrink-0 rounded-lg bg-castiq-blue px-4 py-3 text-sm text-castiq-muted hover:text-castiq-white"
        >
          Filter
        </button>
      </div>

      {/* Species chips */}
      <div className="px-4 pb-2">
        <SpeciesChips selected={selectedSpecies} onChange={setSelectedSpecies} />
      </div>

      {/* Map — takes remaining height */}
      <div className="relative flex-1">
        {geoLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <MapView
            center={[center.lng, center.lat]}
            zoom={8}
            lakes={nearbyLakes}
            onLakeClick={(lake) => setSelectedLake(lake)}
          />
        )}

        {/* Lake preview sheet — appears when a pin is clicked */}
        {selectedLake && (
          <div className="absolute bottom-32 left-4 right-4 z-10 rounded-xl bg-castiq-blue p-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-castiq-white">{selectedLake.name}</h2>
                <p className="text-xs text-castiq-muted">
                  {selectedLake.county} County · {selectedLake.acreage?.toLocaleString()} ac
                </p>
              </div>
              <button
                onClick={() => setSelectedLake(null)}
                className="text-castiq-muted hover:text-castiq-white"
              >
                ✕
              </button>
            </div>
            <button
              onClick={() => navigate(`/lake/${selectedLake.id}`)}
              className="mt-3 w-full rounded-lg bg-castiq-teal py-2 text-sm font-medium text-castiq-blue-dark"
            >
              View Lake Details →
            </button>
          </div>
        )}
      </div>

      {/* Nearby lakes bottom strip */}
      <div className="border-t border-castiq-blue bg-castiq-blue-dark">
        <div className="px-4 py-2">
          <p className="text-xs font-medium text-castiq-muted">
            {lakesLoading
              ? 'Finding lakes…'
              : selectedSpecies === 'all'
                ? `${nearbyLakes.length} top Minnesota lakes`
                : `${nearbyLakes.length} recommended for ${SPECIES_OPTIONS.find((option) => option.id === selectedSpecies)?.label ?? 'this species'}`}
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {lakesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-40 shrink-0 animate-pulse rounded-lg bg-castiq-blue"
                />
              ))
            : nearbyLakes.slice(0, 8).map((lake) => {
                const lastReport: Date | null = lake.lastReportDate
                  ? ((lake.lastReportDate as unknown as { toDate?: () => Date }).toDate?.() ?? null)
                  : null;
                const dotColor = getPinColor(lastReport);

                return (
                  <button
                    key={lake.id}
                    onClick={() => navigate(`/lake/${lake.id}`)}
                    className="flex h-20 w-44 shrink-0 flex-col justify-between rounded-lg bg-castiq-blue p-3 text-left hover:bg-castiq-blue/80"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-castiq-white leading-tight truncate pr-1">
                        {lake.name}
                      </span>
                      <span
                        className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap gap-1">
                        {(lake.speciesPresent ?? []).slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-castiq-blue-dark px-1.5 py-0.5 text-[10px] text-castiq-muted capitalize"
                          >
                            {s.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      {lastReport && (
                        <p className="text-[10px] text-castiq-muted">
                          {formatReportAge(lastReport)}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}

          {nearbyLakes.length === 0 && !lakesLoading && (
            <p className="py-4 text-sm text-castiq-muted">
              {selectedSpecies === 'all'
                ? 'No lakes are loaded yet.'
                : 'No lakes on file list this species yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
