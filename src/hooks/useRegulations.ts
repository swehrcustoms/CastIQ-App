import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import type { Regulation, RegulationAlert } from '../types/regulations';

interface UseRegulationsResult {
  regulations: Regulation[];
  alerts: RegulationAlert[];
  loading: boolean;
  error: Error | null;
}

const regulationLookupFn = httpsCallable<
  { lakeId: string; species?: string; year?: number },
  { regulations: Regulation[]; alerts: RegulationAlert[] }
>(functions, 'regulationLookupService');

export function useRegulations(
  lakeId: string | null,
  species?: string
): UseRegulationsResult {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [alerts, setAlerts] = useState<RegulationAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lakeId) return;

    setLoading(true);
    regulationLookupFn({ lakeId, species, year: new Date().getFullYear() })
      .then((result) => {
        setRegulations(result.data.regulations);
        setAlerts(result.data.alerts);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err : new Error('Regs fetch failed')))
      .finally(() => setLoading(false));
  }, [lakeId, species]);

  return { regulations, alerts, loading, error };
}
