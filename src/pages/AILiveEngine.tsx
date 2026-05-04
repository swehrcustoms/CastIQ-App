import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AIReportEngine } from '../components/ai/AIReportEngine';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import type { Lake } from '../types/lake';
import type { WithId } from '../types/common';

export function AILiveEngine() {
  const { lakeId } = useParams<{ lakeId: string }>();
  const navigate = useNavigate();
  const [lake, setLake] = useState<WithId<Lake> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lakeId) return;
    getDoc(doc(db, 'lakes', lakeId))
      .then((snap) => {
        if (snap.exists()) setLake({ id: snap.id, ...snap.data() } as WithId<Lake>);
      })
      .finally(() => setLoading(false));
  }, [lakeId]);

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
        <button onClick={() => navigate(-1)} className="text-sm text-castiq-teal">
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-castiq-blue-dark">
      {/* Nav */}
      <div className="flex items-center gap-3 border-b border-castiq-blue px-4 py-3">
        <button
          onClick={() => navigate(`/lake/${lakeId}`)}
          className="text-sm text-castiq-muted hover:text-castiq-white"
        >
          ← {lake.name}
        </button>
        <span className="ml-auto rounded-full bg-castiq-teal/20 px-3 py-1 text-xs text-castiq-teal">
          ⚡ AI Powered
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AIReportEngine lakeId={lake.id} lakeName={lake.name} />
      </div>
    </div>
  );
}
