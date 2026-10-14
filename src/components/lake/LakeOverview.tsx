import { Link } from 'react-router-dom';
import { guideSeason, plansForSpecies, seasonLabel } from '../../data/baitSuggestions';
import { formatTimestamp, toDate } from '../../utils/dates';
import { SourceAttribution } from '../shared/SourceAttribution';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { Lake } from '../../types/lake';
import type { AnglerReport } from '../../types/user';
import type { WithId } from '../../types/common';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-castiq-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-castiq-white">{value}</dd>
    </div>
  );
}

export function LakeOverview({
  lake,
  species,
  report,
  loading,
}: {
  lake: WithId<Lake>;
  species: string;
  report: AnglerReport | null;
  loading: boolean;
}) {
  const season = guideSeason(new Date());
  const tactics = plansForSpecies(lake.speciesPresent ?? [], season, species === 'all' ? 'all' : species);
  const reportDate = report ? toDate(report.reportDate) : null;

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-castiq-blue p-4">
        <h2 className="text-sm font-semibold text-castiq-white">Last reported conditions</h2>
        {loading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}
        {!loading && !report && (
          <p className="mt-3 text-sm text-castiq-muted">No recent reports</p>
        )}
        {!loading && report && (
          <>
            <p className="mt-1 text-xs text-castiq-muted">
              Observed {formatTimestamp(reportDate)}. This is a dated report, not a live condition.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Lures" value={report.lures?.length ? report.lures.join(', ') : 'Not available'} />
              <Field label="Colors" value={report.colors?.length ? report.colors.join(', ') : 'Not available'} />
              <Field label="Water temperature" value={report.waterTempF != null ? `${report.waterTempF}°F` : 'Not available'} />
              <Field label="Structure" value={report.structureType || 'Not available'} />
              <Field label="Target depth" value={report.depthFt != null ? `${report.depthFt} ft` : 'Not available'} />
              <Field label="Time of day" value={report.timeOfDay || 'Not available'} />
            </dl>
            {report.conditions && <p className="mt-3 text-sm text-castiq-muted">{report.conditions}</p>}
            {report.aiSummary && <p className="mt-2 text-sm text-castiq-white">{report.aiSummary}</p>}
            <div className="mt-3">
              <SourceAttribution
                sourceName={report.sourceId ?? (report.userSubmitted ? 'Angler report' : 'Unknown')}
                type={report.userSubmitted ? 'user' : 'RSS'}
              />
            </div>
          </>
        )}
      </section>

      <section className="rounded-lg bg-castiq-blue p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-castiq-white">Tactics</h2>
            <p className="mt-1 text-xs text-castiq-muted">
              Seasonal bait suggestions for {seasonLabel(season).toLowerCase()}. These are editorial notes, not a report from this lake.
            </p>
          </div>
          <Link to="/tactics" className="shrink-0 text-xs text-castiq-teal hover:underline">
            All tactics
          </Link>
        </div>
        {tactics.length === 0 ? (
          <p className="mt-3 text-sm text-castiq-muted">Not available for this species on this water yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {tactics.slice(0, 2).map((plan) => (
              <li key={plan.id}>
                <p className="text-sm font-medium text-castiq-teal">{plan.label}</p>
                {plan.note && <p className="mt-1 text-xs text-castiq-muted">{plan.note}</p>}
                <p className="mt-1 text-sm text-castiq-white">
                  {plan.baits[0] ? `${plan.baits[0].lure} — ${plan.baits[0].detail}` : 'Not available'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
