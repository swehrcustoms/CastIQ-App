import { lakePlaceLabel } from '../../services/dnrLakeSearch';
import type { Lake } from '../../types/lake';
import type { WithId } from '../../types/common';
import { speciesLabel, speciesShownForLake } from '../../utils/species';

interface Props {
  lake: WithId<Lake>;
}

export function LakeHeader({ lake }: Props) {
  const species = speciesShownForLake(lake.speciesPresent);
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-castiq-white">{lake.name}</h1>
          <p className="text-sm text-castiq-muted">
            {lakePlaceLabel(lake)} · DNR #{lake.dnrLakeNumber} · {lake.waterType}
          </p>
        </div>
        {lake.jurisdiction !== 'MN' && (
          <span className="shrink-0 rounded-full bg-blue-900/60 px-3 py-1 text-xs font-medium text-blue-300">
            Border Water · {lake.jurisdiction}
          </span>
        )}
      </div>

      {/* Quick stats row */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-castiq-muted">
          <span className="font-medium text-castiq-white">
            {lake.acreage?.toLocaleString() ?? '—'}
          </span>{' '}
          acres
        </span>
        <span className="text-castiq-muted">
          <span className="font-medium text-castiq-white">
            {lake.maxDepthFt ?? '—'}
          </span>{' '}
          ft max depth
        </span>
        {lake.avgDepthFt && (
          <span className="text-castiq-muted">
            <span className="font-medium text-castiq-white">{lake.avgDepthFt}</span> ft avg
          </span>
        )}
      </div>

      {/* AIS warning */}
      {lake.AISPresent && lake.AISPresent.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-300">
          <span>⚠</span>
          <span>AIS Present: {lake.AISPresent.join(', ')}</span>
        </div>
      )}

      {species.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {species.map((s) => (
            <span
              key={s}
              className="rounded-full bg-castiq-blue px-2.5 py-0.5 text-xs text-castiq-muted"
            >
              {speciesLabel(s)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
