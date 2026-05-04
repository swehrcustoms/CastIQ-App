import type { WeatherCache } from '../../types/cache';

interface Props {
  weather: Partial<WeatherCache> | null;
  loading?: boolean;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-castiq-muted">{label}</span>
      <span className="text-sm font-semibold text-castiq-white">{value}</span>
    </div>
  );
}

export function WeatherStrip({ weather, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-14 items-center justify-center">
        <span className="animate-pulse text-sm text-castiq-muted">Loading weather…</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex h-14 items-center justify-center">
        <span className="text-sm text-castiq-muted">Weather data unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-around overflow-x-auto rounded-lg bg-castiq-blue px-4 py-3">
      {weather.waterTempF != null && (
        <Stat label="Water" value={`${weather.waterTempF}°F`} />
      )}
      {weather.airTempF != null && (
        <Stat label="Air" value={`${weather.airTempF}°F`} />
      )}
      {weather.windSpeedMph != null && (
        <Stat label="Wind" value={`${weather.windSpeedMph} mph ${weather.windDirection ?? ''}`} />
      )}
      {weather.pressureInHg != null && (
        <Stat label="Pressure" value={`${weather.pressureInHg.toFixed(2)}" Hg`} />
      )}
      {weather.cloudCover != null && (
        <Stat label="Clouds" value={`${weather.cloudCover}%`} />
      )}
    </div>
  );
}
