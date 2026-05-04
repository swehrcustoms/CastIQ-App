import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import type { WeatherCache } from '../types/cache';

interface WeatherResult {
  weather: Partial<WeatherCache> | null;
  loading: boolean;
  error: Error | null;
  refetch: (lakeId: string, lat: number, lng: number) => Promise<void>;
}

const cacheLayerFn = httpsCallable<
  { lakeId: string; lat: number; lng: number },
  { weather: Partial<WeatherCache>; cached: boolean }
>(functions, 'cacheLayer');

export function useWeather(): WeatherResult {
  const [weather, setWeather] = useState<Partial<WeatherCache> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (lakeId: string, lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cacheLayerFn({ lakeId, lat, lng });
      setWeather(result.data.weather);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Weather fetch failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, error, refetch };
}
