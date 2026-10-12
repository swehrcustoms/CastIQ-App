import { Link } from 'react-router-dom';
import { useLakeRegulations } from '../../hooks/useLakeRegulations';
import { AppCard } from '../ui/Data';
import { EmptyState, ErrorState, SkeletonCard } from '../ui/States';
import { SourceFooter } from '../ui/Chrome';
import { formatLimit, formatSeason, formatSize } from '../../utils/regFormat';
import { speciesLabel } from '../../utils/species';
import type { Regulation } from '../../types/regulations';
import type { WithId } from '../../types/common';

function newestBySpecies(regulations: WithId<Regulation>[]): WithId<Regulation>[] {
  const sorted = [...regulations].sort((a, b) => b.effectiveYear - a.effectiveYear);
  const seen = new Set<string>();
  const current: WithId<Regulation>[] = [];
  for (const regulation of sorted) {
    const key = regulation.species.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    current.push(regulation);
  }
  return current;
}

export function RegulationsSummary({ lakeId, lakeName }: { lakeId: string; lakeName: string }) {
  const { data, loading, error, reload } = useLakeRegulations(lakeId);

  if (loading) return <SkeletonCard lines={4} />;
  if (error) return <ErrorState title="We couldn't load regulations for this lake." onRetry={reload} />;

  const current = newestBySpecies(data.regulations);
  const alerts = data.alerts;

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                alert.severity === 'critical'
                  ? 'border-castiq-red/40 bg-red-950/40'
                  : alert.severity === 'warning'
                    ? 'border-castiq-yellow/40 bg-castiq-yellow/10'
                    : 'border-castiq-teal/30 bg-castiq-teal/10'
              }`}
            >
              <p className="font-medium text-castiq-white">{alert.title}</p>
              <p className="mt-1 text-castiq-muted">{alert.body}</p>
            </li>
          ))}
        </ul>
      )}

      {current.length === 0 ? (
        <EmptyState
          title="No lake-specific regulations have been published."
          message={`Statewide rules may still apply on ${lakeName}. Confirm the current season before you keep fish.`}
          action={
            <Link to="/regulations" className="ciq-btn-primary">
              View all regulations
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {current.map((regulation) => (
            <li key={regulation.id}>
              <AppCard className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-castiq-white">{speciesLabel(regulation.species)}</h3>
                  <span className="text-xs text-castiq-muted">{regulation.effectiveYear}</span>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-castiq-muted">Daily limit</dt>
                    <dd className="text-castiq-white">{formatLimit(regulation.dailyLimit)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-castiq-muted">Size</dt>
                    <dd className="text-castiq-white">{formatSize(regulation)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-castiq-muted">Season</dt>
                    <dd className="text-castiq-white">{formatSeason(regulation)}</dd>
                  </div>
                  {regulation.possessionLimit != null && (
                    <div>
                      <dt className="text-xs text-castiq-muted">Possession</dt>
                      <dd className="text-castiq-white">{formatLimit(regulation.possessionLimit, 'in possession')}</dd>
                    </div>
                  )}
                </dl>
                {regulation.specialNotes && (
                  <p className="mt-3 text-sm text-castiq-muted">{regulation.specialNotes}</p>
                )}
                {regulation.gearRestrictions && (
                  <p className="mt-2 text-xs text-castiq-muted">{regulation.gearRestrictions}</p>
                )}
                {regulation.artificialOnly && (
                  <p className="mt-2 text-xs text-castiq-yellow">Artificial lures only</p>
                )}
              </AppCard>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/regulations" className="ciq-btn-primary">
          View all regulations
        </Link>
      </div>
      <SourceFooter>
        This is a summary of regulation records loaded for {lakeName}. Rules change. Confirm them with the managing agency before you fish.
      </SourceFooter>
    </div>
  );
}
