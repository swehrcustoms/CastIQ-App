import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FeatureMap } from '../components/map/FeatureMap';
import { PageContainer, PageHeader, SectionHeader, SourceFooter } from '../components/ui/Chrome';
import { AppCard, DataFreshnessBadge, FilterChip } from '../components/ui/Data';
import { AlertBanner, EmptyState, ErrorState, SkeletonGrid } from '../components/ui/States';
import { useIceIntel } from '../hooks/useIceIntel';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatTimestamp, hoursSince, toDate } from '../utils/dates';
import { speciesLabel } from '../utils/species';
import type { IceReport } from '../types/events';
import type { WithId } from '../types/common';

type Freshness = 'any' | '48h' | '7d' | '30d';
type Thickness = 'any' | 'under6' | 'mid' | 'over12';

function caution(report: IceReport, date: Date | null): { label: string; className: string } {
  const hours = hoursSince(date);
  if (hours == null) return { label: 'Very limited data', className: 'text-castiq-muted' };
  if (hours > 24 * 7) return { label: 'Stale report', className: 'text-castiq-yellow' };
  if (report.iceTotalIn < 4 || report.safetyRating === 'unsafe' || report.safetyRating === 'open water') {
    return { label: 'Use extreme caution', className: 'text-castiq-red' };
  }
  if (hours <= 48) return { label: 'Recent report available', className: 'text-castiq-green' };
  return { label: 'Conditions vary', className: 'text-castiq-yellow' };
}

function sourceLabel(submittedBy: string): string {
  if (!submittedBy) return 'Source not listed';
  if (submittedBy.length > 24 && !submittedBy.includes(' ')) return 'Angler report';
  return submittedBy;
}

export function IceFishing() {
  const { data, loading, error, reload } = useIceIntel();
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('all');
  const [freshness, setFreshness] = useState<Freshness>('any');
  const [thickness, setThickness] = useState<Thickness>('any');
  const [roadsOnly, setRoadsOnly] = useState(false);
  usePageTitle('Ice fishing');

  const lakesById = useMemo(() => new Map(data.lakes.map((lake) => [lake.id, lake])), [data.lakes]);
  const openRoadLakes = useMemo(
    () => new Set(data.roads.filter((road) => road.status === 'open').map((road) => road.lakeId)),
    [data.roads],
  );
  const counties = useMemo(
    () => [...new Set(data.reports.map((report) => report.county).filter(Boolean))].sort(),
    [data.reports],
  );

  const reports = data.reports.filter((report) => {
    const lake = lakesById.get(report.lakeId);
    const name = `${lake?.name ?? ''} ${report.county}`.toLowerCase();
    if (search.trim() && !name.includes(search.trim().toLowerCase())) return false;
    if (county !== 'all' && report.county !== county) return false;
    const date = toDate(report.reportDate);
    const hours = hoursSince(date);
    if (freshness === '48h' && (hours == null || hours > 48)) return false;
    if (freshness === '7d' && (hours == null || hours > 24 * 7)) return false;
    if (freshness === '30d' && (hours == null || hours > 24 * 30)) return false;
    if (thickness === 'under6' && report.iceTotalIn >= 6) return false;
    if (thickness === 'mid' && (report.iceTotalIn < 6 || report.iceTotalIn > 12)) return false;
    if (thickness === 'over12' && report.iceTotalIn <= 12) return false;
    if (roadsOnly && !openRoadLakes.has(report.lakeId)) return false;
    return true;
  });

  const points = reports.flatMap((report) => {
    const lake = lakesById.get(report.lakeId);
    if (!lake || !Number.isFinite(lake.lat) || !Number.isFinite(lake.lng)) return [];
    return [{
      id: report.id,
      lng: lake.lng,
      lat: lake.lat,
      color: report.iceTotalIn < 4 ? '#ef4444' : report.iceTotalIn < 8 ? '#eab308' : '#22c55e',
      label: `${lake.name}, ${report.iceTotalIn} inches reported`,
    }];
  });
  const mapCenter: [number, number] = points[0]
    ? [points[0].lng, points[0].lat]
    : [-94.5, 46.5];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Winter"
        title="Ice Fishing Intelligence"
        subtitle="Recent thickness, access, and winterkill notes. Measurements describe one place at one time."
      />

      <div className="mb-5">
        <AlertBanner tone="warning">
          Reported ice thickness is informational only. Ice conditions vary across a lake and can change rapidly. No report guarantees safe ice. Verify conditions locally before travel.
        </AlertBanner>
      </div>

      {loading && <SkeletonGrid count={3} />}
      {error && <ErrorState title="We couldn't load ice reports." onRetry={reload} />}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-castiq-muted">Lake or county</span>
              <input className="ciq-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reports" />
            </label>
            <label>
              <span className="mb-1 block text-xs text-castiq-muted">County</span>
              <select className="ciq-input" value={county} onChange={(event) => setCounty(event.target.value)}>
                <option value="all">All counties</option>
                {counties.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-castiq-muted">Freshness</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {([
                ['any', 'Any age'],
                ['48h', 'Last 48 hours'],
                ['7d', 'Last 7 days'],
                ['30d', 'Last 30 days'],
              ] as const).map(([id, label]) => (
                <FilterChip key={id} selected={freshness === id} onClick={() => setFreshness(id)}>{label}</FilterChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-castiq-muted">Reported thickness</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {([
                ['any', 'Any'],
                ['under6', 'Under 6 in'],
                ['mid', '6–12 in'],
                ['over12', 'Over 12 in'],
              ] as const).map(([id, label]) => (
                <FilterChip key={id} selected={thickness === id} onClick={() => setThickness(id)}>{label}</FilterChip>
              ))}
              <FilterChip selected={roadsOnly} onClick={() => setRoadsOnly((value) => !value)}>
                Open ice road
              </FilterChip>
            </div>
          </div>

          <div className="h-80 overflow-hidden rounded-xl border border-white/10">
            <FeatureMap center={mapCenter} zoom={points.length ? 7 : 5} points={points} />
          </div>
          <p className="text-xs text-castiq-muted">
            Pins use the lake’s published center, not the exact hole. Color reflects the reported total thickness only.
          </p>

          {reports.length === 0 ? (
            <EmptyState
              title="No ice reports match."
              message={data.reports.length === 0
                ? 'No ice thickness reports have been published yet.'
                : 'Try a wider freshness window or clear the filters.'}
            />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {reports.map((report) => (
                <IceCard key={report.id} report={report} lakeName={lakesById.get(report.lakeId)?.name} />
              ))}
            </ul>
          )}

          <section>
            <SectionHeader title="Ice roads and access" />
            {data.roads.length === 0 ? (
              <EmptyState title="No ice roads on file" message="Plowed roads and access status will appear here when an operator publishes them." />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {data.roads.map((road) => {
                  const lake = lakesById.get(road.lakeId);
                  return (
                    <li key={road.id}>
                      <AppCard>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-castiq-white">{road.name}</h3>
                          <span className={`text-xs uppercase ${road.status === 'open' ? 'text-castiq-green' : 'text-castiq-yellow'}`}>
                            {road.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-castiq-muted">
                          {lake ? <Link to={`/lake/${lake.id}`} className="text-castiq-teal hover:underline">{lake.name}</Link> : 'Lake not linked'}
                          {' · '}{road.lengthMiles} mi
                          {road.weightLimitLbs ? ` · ${road.weightLimitLbs.toLocaleString()} lb limit` : ''}
                        </p>
                        <p className="mt-2 text-xs text-castiq-muted">
                          {road.operatedBy || 'Operator not listed'} · <DataFreshnessBadge date={road.lastUpdated} prefix="Updated" />
                        </p>
                      </AppCard>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <SectionHeader title="Winterkill notes" />
            {data.winterkill.length === 0 ? (
              <p className="text-sm text-castiq-muted">No winterkill events are in the recent record.</p>
            ) : (
              <ul className="space-y-2">
                {data.winterkill.map((event) => {
                  const lake = lakesById.get(event.lakeId);
                  return (
                    <li key={event.id} className="ciq-card px-4 py-3 text-sm">
                      <p className="font-medium text-castiq-white">
                        {lake ? <Link to={`/lake/${lake.id}`} className="hover:text-castiq-teal">{lake.name}</Link> : 'Lake'} · {event.eventYear} · {event.severity}
                      </p>
                      <p className="mt-1 text-castiq-muted">
                        {(event.affectedSpecies ?? []).map(speciesLabel).join(', ') || 'Species not listed'}
                        {event.outcome ? ` · ${event.outcome}` : ''}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <SourceFooter>
            Ice reports are crowd-sourced or agency notes stored in CastIQ. A reporter rating is that person’s assessment, not a CastIQ travel approval.
          </SourceFooter>
        </div>
      )}
    </PageContainer>
  );
}

function IceCard({ report, lakeName }: { report: WithId<IceReport>; lakeName?: string }) {
  const date = toDate(report.reportDate);
  const status = caution(report, date);
  return (
    <li>
      <AppCard className="h-full">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-castiq-white">
            {lakeName ? <Link to={`/lake/${report.lakeId}`} className="hover:text-castiq-teal">{lakeName}</Link> : 'Lake'}
          </h3>
          <span className={`text-xs font-medium ${status.className}`}>{status.label}</span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-castiq-white">{report.iceTotalIn} in</p>
        <p className="text-xs text-castiq-muted">
          Black {report.iceBlackIn} in · White {report.iceWhiteIn} in · Snow {report.snowDepthIn} in
        </p>
        <p className="mt-2 text-sm text-castiq-muted">{formatTimestamp(date)}</p>
        {report.accessPoints?.length > 0 && (
          <p className="mt-2 text-sm text-castiq-white">Access · {report.accessPoints.join(', ')}</p>
        )}
        {report.fishingConditions && <p className="mt-2 text-sm text-castiq-muted">{report.fishingConditions}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-castiq-muted">
          <span>Reporter rating · {report.safetyRating}</span>
          <span>· {report.verified ? 'Verified' : 'Unverified'}</span>
          <span>· {sourceLabel(report.submittedBy)}</span>
          <DataFreshnessBadge date={date} prefix="Reported" />
        </div>
      </AppCard>
    </li>
  );
}
