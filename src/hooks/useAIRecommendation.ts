import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

export interface LureRecommendation {
  lure: string;
  color: string;
  depthFt: number;
  technique: string;
  confidence: number;
  reasoning: string;
}

export interface AIRecommendation {
  recommendations: LureRecommendation[];
  overallConfidence: number;
  summaryNote: string;
}

interface UseAIRecommendationResult {
  recommendation: AIRecommendation | null;
  loading: boolean;
  error: Error | null;
  fetch: (payload: AIRecommendationPayload) => Promise<void>;
}

export interface AIRecommendationPayload {
  lakeId: string;
  species: string;
  season: 'spring' | 'summer' | 'fall' | 'ice';
  waterTempF: number;
  pressureInHg: number;
  windSpeedMph: number;
  latestReports: string[];
  nettingSurveyCPUE: number;
  lastStockDate: string | null;
}

const aiSummarizationFn = httpsCallable<
  { task: string; payload: unknown },
  { result: string; task: string }
>(functions, 'aiSummarizationService');

export function useAIRecommendation(): UseAIRecommendationResult {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (payload: AIRecommendationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiSummarizationFn({ task: 'lure_recommendation', payload });
      const parsed = JSON.parse(result.data.result) as AIRecommendation;
      setRecommendation(parsed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('AI recommendation failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { recommendation, loading, error, fetch };
}
