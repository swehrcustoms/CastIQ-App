import { formatRelative, formatTimestamp, toDate } from '../../utils/dates';
import { latestReportsBySpecies } from '../../utils/reportIdentity';
import { speciesLabel } from '../../utils/species';
import { SourceAttribution } from '../shared/SourceAttribution';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { AnglerReport } from '../../types/user';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-castiq-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-castiq-white">{value}</dd>
    </div>
  );
}

function textOrMissing(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : 'Not recorded on this report';
}

function ReportedTactic({ report }: { report: AnglerReport }) {
  const lures = report.lures?.length ? report.lures.join(', ') : 'Not recorded on this report';
  const colors = report.colors?.length ? report.colors.join(', ') : 'Not recorded on this report';
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <h3 className="text-sm font-semibold text-castiq-white">Most recent tactic</h3>
      <p className="mt-2 text-sm text-castiq-white">{textOrMissing(report.technique)}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Lures" value={lures} />
        <Field label="Colors" value={colors} />
        <Field label="Structure" value={textOrMissing(report.structureType)} />
        <Field label="Target depth" value={report.depthFt != null ? `${report.depthFt} ft` : 'Not recorded on this report'} />
        <Field label="Time of day" value={textOrMissing(report.timeOfDay)} />
      </dl>
    </div>
  );
}

function SpeciesReport({ species, report }: { species: string; report: AnglerReport }) {
  const reportDate = toDate(report.reportDate);
  return (
    <article className="rounded-lg bg-castiq-blue p-4">
      <h2 className="text-sm font-semibold text-castiq-white">
        {species === 'unspecified' ? 'Species not listed' : speciesLabel(species)}
      </h2>
      <p className="mt-1 text-xs text-castiq-muted">
        Most recent report {formatRelative(reportDate)} · {formatTimestamp(reportDate)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Lures" value={report.lures?.length ? report.lures.join(', ') : 'Not recorded on this report'} />
        <Field label="Colors" value={report.colors?.length ? report.colors.join(', ') : 'Not recorded on this report'} />
        <Field label="Water temperature" value={report.waterTempF != null ? `${report.waterTempF}°F` : 'Not recorded on this report'} />
        <Field label="Structure" value={textOrMissing(report.structureType)} />
        <Field label="Target depth" value={report.depthFt != null ? `${report.depthFt} ft` : 'Not recorded on this report'} />
        <Field label="Time of day" value={textOrMissing(report.timeOfDay)} />
      </dl>
      {report.conditions?.trim() && <p className="mt-3 text-sm text-castiq-muted">{report.conditions}</p>}
      <ReportedTactic report={report} />
      <div className="mt-3">
        <SourceAttribution
          sourceName={report.sourceId ?? (report.userSubmitted ? 'Angler report' : 'Unknown')}
          type={report.userSubmitted ? 'user' : 'RSS'}
        />
      </div>
    </article>
  );
}

export function LakeOverview({
  species,
  reports,
  loading,
  error,
}: {
  species: string;
  reports: AnglerReport[];
  loading: boolean;
  error: Error | null;
}) {
  const latest = latestReportsBySpecies(reports);

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex justify-center rounded-lg bg-castiq-blue py-6">
          <LoadingSpinner />
        </div>
      )}
      {!loading && error && (
        <p className="rounded-lg bg-castiq-blue px-4 py-3 text-sm text-castiq-muted">
          Reports could not be loaded. Refresh the page to try again.
        </p>
      )}
      {!loading && !error && latest.length === 0 && (
        <p className="rounded-lg bg-castiq-blue px-4 py-3 text-sm text-castiq-muted">
          {species === 'all'
            ? 'No public report has been logged for this lake yet. Conditions and tactics appear here as soon as one is saved.'
            : `No public report has been logged for ${speciesLabel(species).toLowerCase()} on this lake yet.`}
        </p>
      )}
      {!loading && !error && latest.map((item) => (
        <SpeciesReport key={`${item.species}-${item.report.reportId}`} species={item.species} report={item.report} />
      ))}
    </div>
  );
}
