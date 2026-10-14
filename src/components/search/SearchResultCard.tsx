import { useNavigate } from 'react-router-dom';
import type { Lake } from '../../types/lake';
import type { WithId } from '../../types/common';
import { lakePlaceLabel } from '../../services/dnrLakeSearch';
import { mapboxStaticUrl } from '../../utils/geoUtils';
import { toDate } from '../../utils/dates';
import { formatReportAge, getPinColor } from '../../utils/reportRecencyColor';

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

interface Props {
  lake: WithId<Lake>;
}

export function SearchResultCard({ lake }: Props) {
  const navigate = useNavigate();

  const lastReport = toDate(lake.lastReportDate);
  const pinColor = getPinColor(lastReport);

  const thumbnailUrl = TOKEN
    ? mapboxStaticUrl(lake.lng, lake.lat, 11, 120, 90, TOKEN)
    : null;

  return (
    <button
      onClick={() => navigate(`/lake/${lake.id}`)}
      className="w-full rounded-lg bg-castiq-blue p-4 text-left transition-colors hover:bg-castiq-blue/80 flex gap-4"
    >
      {/* Map thumbnail */}
      <div className="relative shrink-0 h-[72px] w-[96px] overflow-hidden rounded-md bg-castiq-blue-dark">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Map of ${lake.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🗺</div>
        )}
        {/* Recency dot */}
        <span
          className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-castiq-blue"
          style={{ backgroundColor: pinColor }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-castiq-white truncate">{lake.name}</h3>
          {lake.borderWater && (
            <span className="shrink-0 text-xs text-blue-400">Border</span>
          )}
        </div>

        <p className="text-xs text-castiq-muted">
          {lakePlaceLabel(lake)}
          {lake.acreage ? ` · ${Math.round(lake.acreage).toLocaleString()} ac` : ''}
          {lake.maxDepthFt ? ` · ${lake.maxDepthFt} ft` : ''}
        </p>

        {/* Species chips */}
        <div className="flex flex-wrap gap-1">
          {(lake.speciesPresent ?? []).slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full bg-castiq-blue-dark px-2 py-0.5 text-xs text-castiq-muted capitalize"
            >
              {s.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Report count + last report */}
        <div className="flex items-center gap-3 text-xs text-castiq-muted">
          {(lake.reportCount7d ?? 0) > 0 ? (
            <span className="text-castiq-green font-medium">
              {lake.reportCount7d} report{lake.reportCount7d !== 1 ? 's' : ''} this week
            </span>
          ) : (
            <span>No reports this week</span>
          )}
          {lastReport && <span>· {formatReportAge(lastReport)}</span>}
        </div>
      </div>
    </button>
  );
}
