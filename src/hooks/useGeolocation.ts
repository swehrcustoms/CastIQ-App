import { useState, useEffect } from 'react';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface UseGeolocationResult {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
}

// Minnesota geographic center — used as fallback when geolocation is unavailable
export const MN_CENTER: GeoLocation = { lat: 46.5, lng: -94.0 };

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  return { location, loading, error };
}
