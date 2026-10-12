import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { fetchDnrLake } from '../services/dnrLakeSearch';
import { db } from '../services/firebase';
import { LakeHeader } from '../components/lake/LakeHeader';
import { LakeTabNav } from '../components/lake/LakeTabNav';
import { ReportFeed } from '../components/lake/ReportFeed';
import { LakeHealthSnapshot } from '../components/lake/LakeHealthSnapshot';
import { LurePanel } from '../components/ai/LurePanel';
import { WeatherStrip } from '../components/shared/WeatherStrip';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { SpeciesChips } from '../components/shared/SpeciesChips';
import { FavoriteButton } from '../components/lake/FavoriteButton';
import { SurveysStockingPanel } from '../components/lake/SurveysStockingPanel';
import { WaterQualityPanel } from '../components/lake/WaterQualityPanel';
import { RegulationsSummary } from '../components/lake/RegulationsSummary';
import { useWeather } from '../hooks/useWeather';
import { isLakeTab, type LakeTab } from '../components/lake/LakeTabNav';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export function LakeDetail() {
  const { lakeId } = useParams<{ lakeId: string }>();
  const navigate = useNavigate();
  const [lake, setLake] = useState<WithId<Lake> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: LakeTab = isLakeTab(tabParam) ? tabParam : 'overview';
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather();

  useEffect(() => {
    if (!lakeId) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getDoc(doc(db, 'lakes', lakeId))
      .then(async (snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          setLake({ id: snap.id, ...snap.data() } as WithId<Lake>);
          return;
        }
        const fromCatalog = await fetchDnrLake(lakeId);
        if (!cancelled) setLake(fromCatalog);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error(err);
        setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lakeId]);

  function selectTab(tab: LakeTab) {
    setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true });
  }

  // Fetch weather once lake is loaded
  useEffect(() => {
    if (lake && lakeId) {
      refetchWeather(lakeId, lake.lat, lake.lng);
    }
  }, [lake, lakeId, refetchWeather]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-castiq-white">We couldn't load this lake.</p>
        <button type="button" onClick={() => window.location.reload()} className="ciq-btn-primary">
          Try again
        </button>
      </div>
    );
  }

  if (!lake) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-castiq-white">Lake not found</p>
        <button type="button" onClick={() => navigate('/search')} className="text-sm text-castiq-teal">
          ← Back to search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Back nav */}
      <div className="flex items-center gap-3 border-b border-castiq-blue px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-castiq-muted hover:text-castiq-white"
        >
          ← Back
        </button>
        <span className="text-castiq-muted">/</span>
        <span className="text-sm text-castiq-muted truncate">{lake.name}</span>

        {/* Live intelligence link */}
        <Link
          to={`/lake/${lakeId}/live`}
          className="ml-auto shrink-0 rounded-lg bg-castiq-teal/20 px-3 py-1.5 text-xs font-medium text-castiq-teal hover:bg-castiq-teal/30"
        >
          Live Intel
        </Link>
      </div>

      {/* Scrollable content */}
      <div>
        <div className="flex items-start justify-between gap-3 px-4 py-4">
          <div className="min-w-0 flex-1">
            <LakeHeader lake={lake} />
          </div>
          <FavoriteButton lakeId={lake.id} />
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
          <Link to={`/lake/${lakeId}/live`} className="ciq-btn-secondary shrink-0">Live Intelligence</Link>
          <Link to={`/lake/${lakeId}/fisheries`} className="ciq-btn-secondary shrink-0">Fisheries</Link>
          <Link to={`/lake/${lakeId}/contours`} className="ciq-btn-secondary shrink-0">Contours</Link>
          <button type="button" className="ciq-btn-secondary shrink-0" onClick={() => selectTab('regulations')}>Regulations</button>
          <Link to="/submit-report" className="ciq-btn-secondary shrink-0">Submit Report</Link>
        </div>

        {/* Weather strip */}
        <div className="px-4 pb-4">
          <WeatherStrip weather={weather} loading={weatherLoading} />
        </div>

        {/* Tab navigation */}
        <div className="px-4">
          <LakeTabNav
            active={activeTab}
            onSelect={selectTab}
            reportCount={lake.reportCount7d}
          />
        </div>

        {/* Tab content */}
        <div className="px-4 py-4">
          {activeTab === 'overview' && (
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Main column: report feed */}
              <div className="lg:col-span-2 space-y-4">
                <SpeciesChips selected={selectedSpecies} onChange={setSelectedSpecies} />
                <ReportFeed lakeId={lake.id} filterSpecies={selectedSpecies} />
              </div>

              {/* Sidebar: AI + health */}
              <div className="space-y-4">
                <LurePanel lake={lake} targetSpecies={selectedSpecies === 'all' ? 'walleye' : selectedSpecies} />
                <LakeHealthSnapshot lake={lake} />
              </div>
            </div>
          )}

          {activeTab === 'surveys' && <SurveysStockingPanel lakeId={lake.id} />}

          {activeTab === 'regulations' && (
            <RegulationsSummary lakeId={lake.id} lakeName={lake.name} />
          )}

          {activeTab === 'water' && <WaterQualityPanel lakeId={lake.id} />}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <SpeciesChips selected={selectedSpecies} onChange={setSelectedSpecies} />
              <ReportFeed lakeId={lake.id} filterSpecies={selectedSpecies} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
