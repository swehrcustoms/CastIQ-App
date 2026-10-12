import { useState, useEffect } from 'react';
import { getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Collections } from '../../services/firestore';
import { SourceAttribution } from '../shared/SourceAttribution';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { formatReportAge } from '../../utils/reportRecencyColor';
import { speciesMatches } from '../../utils/species';
import type { AnglerReport } from '../../types/user';

interface Props {
  lakeId: string;
  filterSpecies?: string;
}

const PAGE = 10;

function ReportCard({ report }: { report: AnglerReport }) {
  const reportDate = report.reportDate
    ? (report.reportDate as unknown as { toDate?: () => Date }).toDate?.() ?? new Date()
    : new Date();

  return (
    <div className="rounded-lg bg-castiq-blue p-4 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(report.species ?? []).map((s) => (
            <span
              key={s}
              className="rounded-full bg-castiq-teal/20 px-2 py-0.5 text-xs font-medium text-castiq-teal capitalize"
            >
              {s.replace('_', ' ')}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-xs text-castiq-muted">{formatReportAge(reportDate)}</span>
      </div>

      {/* Summary */}
      {report.aiSummary && (
        <p className="text-sm text-castiq-white">{report.aiSummary}</p>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-castiq-muted sm:grid-cols-3">
        {(report.lures ?? []).length > 0 && (
          <span>🎣 {report.lures.join(', ')}</span>
        )}
        {(report.colors ?? []).length > 0 && (
          <span>🎨 {report.colors.join(', ')}</span>
        )}
        {report.depthFt && <span>📏 {report.depthFt} ft</span>}
        {report.waterTempF && <span>🌡 {report.waterTempF}°F</span>}
        {report.technique && <span>⚡ {report.technique}</span>}
        {report.timeOfDay && <span>🕐 {report.timeOfDay}</span>}
      </div>

      {/* Conditions */}
      {report.conditions && (
        <p className="text-xs text-castiq-muted italic">{report.conditions}</p>
      )}

      {/* Source */}
      <SourceAttribution
        sourceName={report.sourceId ?? (report.userSubmitted ? 'Angler Report' : 'Unknown')}
        type={report.userSubmitted ? 'user' : 'RSS'}
      />
    </div>
  );
}

export function ReportFeed({ lakeId, filterSpecies }: Props) {
  const [reports, setReports] = useState<AnglerReport[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setReports([]);
    setVisibleCount(PAGE);

    getDocs(query(
      Collections.anglerReports,
      where('lakeId', '==', lakeId),
      where('isPublic', '==', true),
      orderBy('reportDate', 'desc'),
      limit(40),
    ))
      .then((snap) => {
        if (cancelled) return;
        const loaded = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return { ...data, reportId: data.reportId || docSnap.id };
        });
        const filtered = !filterSpecies || filterSpecies === 'all'
          ? loaded
          : loaded.filter((report) =>
              (report.species ?? []).some((species) => speciesMatches(species, filterSpecies))
            );
        setReports(filtered);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to load reports'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lakeId, filterSpecies]);

  const visible = reports.slice(0, visibleCount);
  const hasMore = visibleCount < reports.length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 p-4 text-sm text-red-300">
        Failed to load reports. Reports will appear once data ingestion is active.
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-lg bg-castiq-blue p-6 text-center text-sm text-castiq-muted">
        No reports yet for this lake. Be the first to submit one!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((r, i) => (
        <ReportCard key={r.reportId ?? i} report={r} />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + PAGE)}
          className="w-full rounded-lg bg-castiq-blue py-3 text-sm font-medium text-castiq-teal hover:bg-castiq-blue/80"
        >
          Load more reports
        </button>
      )}
    </div>
  );
}
