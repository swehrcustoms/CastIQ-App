import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { LakeHeader } from '../components/lake/LakeHeader';
import { LakeTabNav } from '../components/lake/LakeTabNav';
import { ReportFeed } from '../components/lake/ReportFeed';
import { LakeHealthSnapshot } from '../components/lake/LakeHealthSnapshot';
import { LurePanel } from '../components/ai/LurePanel';
import { WeatherStrip } from '../components/shared/WeatherStrip';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { SpeciesChips } from '../components/shared/SpeciesChips';
import { useWeather } from '../hooks/useWeather';
import type { LakeTab } from '../components/lake/LakeTabNav';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export function LakeDetail() {
  const { lakeId } = useParams<{ lakeId: string }>();
  const navigate = useNavigate();
  const [lake, setLake] = useState<WithId<Lake> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LakeTab>('overview');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather();

  useEffect(() => {
    if (!lakeId) return;
    setLoading(true);
    getDoc(doc(db, 'lakes', lakeId))
      .then((snap) => {
        if (snap.exists()) {
          setLake({ id: snap.id, ...snap.data() } as WithId<Lake>);
        }
      })
      .finally(() => setLoading(false));
  }, [lakeId]);

  // Fetch weather once lake is loaded
  useEffect(() => {
    if (lake && lakeId) {
      refetchWeather(lakeId, lake.lat, lake.lng);
    }
  }, [lake, lakeId, refetchWeather]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-castiq-blue-dark">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!lake) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-castiq-blue-dark">
        <p className="text-castiq-white">Lake not found</p>
        <button onClick={() => navigate('/search')} className="text-sm text-castiq-teal">
          ← Back to search
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-castiq-blue-dark">
      {/* Back nav */}
      <div className="flex items-center gap-3 border-b border-castiq-blue px-4 py-3">
        <button
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
          ⚡ Live Intel
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Lake header */}
        <div className="px-4 py-4">
          <LakeHeader lake={lake} />
        </div>

        {/* Weather strip */}
        <div className="px-4 pb-4">
          <WeatherStrip weather={weather} loading={weatherLoading} />
        </div>

        {/* Tab navigation */}
        <div className="px-4">
          <LakeTabNav
            active={activeTab}
            onSelect={setActiveTab}
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

          {activeTab === 'surveys' && (
            <div className="rounded-lg bg-castiq-blue p-6 text-center text-castiq-muted">
              <p className="font-medium text-castiq-white mb-2">Surveys & Stocking</p>
              <p className="text-sm">
                CPUE trend charts, stocking timeline, and winterkill history coming in Phase 4.
              </p>
            </div>
          )}

          {activeTab === 'regulations' && (
            <div className="rounded-lg bg-castiq-blue p-6 text-center text-castiq-muted">
              <p className="font-medium text-castiq-white mb-2">Regulations</p>
              <p className="text-sm">
                Per-species daily limits, slot rules, season dates, and tribal notes coming in Phase 6.
              </p>
              <Link
                to="/regulations"
                className="mt-3 inline-block text-sm text-castiq-teal hover:underline"
              >
                View Statewide Regulations →
              </Link>
            </div>
          )}

          {activeTab === 'water' && (
            <div className="rounded-lg bg-castiq-blue p-6 text-center text-castiq-muted">
              <p className="font-medium text-castiq-white mb-2">Water Quality</p>
              <p className="text-sm">Secchi depth, pH, DO, and phosphorus data coming in Phase 4.</p>
            </div>
          )}

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
