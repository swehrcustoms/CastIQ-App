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

function formatNum(value: number | null | undefined, suffix = ''): string | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  return `${value}${suffix}`;
}

export function WeatherStrip({ weather, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-14 items-center justify-center rounded-lg bg-castiq-blue">
        <span className="animate-pulse text-sm text-castiq-muted">Loading weather…</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex h-14 items-center justify-center rounded-lg bg-castiq-blue">
        <span className="text-sm text-castiq-muted">Weather data unavailable</span>
      </div>
    );
  }

  const stats: { label: string; value: string }[] = [];

  const water = formatNum(weather.waterTempF, '°F');
  if (water) stats.push({ label: 'Water', value: water });

  const air = formatNum(weather.airTempF, '°F');
  if (air) stats.push({ label: 'Air', value: air });

  if (weather.windSpeedMph != null && !Number.isNaN(Number(weather.windSpeedMph))) {
    const dir = weather.windDirection ? ` ${weather.windDirection}` : '';
    stats.push({ label: 'Wind', value: `${weather.windSpeedMph} mph${dir}` });
  }

  if (weather.pressureInHg != null && !Number.isNaN(Number(weather.pressureInHg))) {
    stats.push({
      label: 'Pressure',
      value: `${Number(weather.pressureInHg).toFixed(2)}" Hg`,
    });
  }

  if (weather.cloudCover != null && !Number.isNaN(Number(weather.cloudCover))) {
    stats.push({ label: 'Clouds', value: `${weather.cloudCover}%` });
  }

  if (stats.length === 0) {
    return (
      <div className="flex h-14 items-center justify-center rounded-lg bg-castiq-blue">
        <span className="text-sm text-castiq-muted">
          Weather pending — set TOMORROW_IO_API_KEY on Functions
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-around overflow-x-auto rounded-lg bg-castiq-blue px-4 py-3">
      {stats.map((s) => (
        <Stat key={s.label} label={s.label} value={s.value} />
      ))}
    </div>
  );
}
