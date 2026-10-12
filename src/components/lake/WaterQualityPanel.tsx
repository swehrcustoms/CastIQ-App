import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLakeWaterQuality } from '../../hooks/useLakeWaterQuality';
import { AppCard, DataFreshnessBadge, MetricCard } from '../ui/Data';
import { EmptyState, ErrorState, SkeletonGrid } from '../ui/States';
import { SourceFooter } from '../ui/Chrome';
import { toDate } from '../../utils/dates';
import type { WaterQuality } from '../../types/surveys';

function numberOrDash(value: number | null | undefined, digits = 1): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : 'No recent data';
}

function clarityNote(samples: WaterQuality[]): string | null {
  const ordered = [...samples].sort(
    (a, b) => (toDate(a.sampleDate)?.getTime() ?? 0) - (toDate(b.sampleDate)?.getTime() ?? 0),
  );
  if (ordered.length < 2) return null;
  const previous = ordered[ordered.length - 2]?.secchiDepthFt;
  const latest = ordered[ordered.length - 1]?.secchiDepthFt;
  if (typeof previous !== 'number' || typeof latest !== 'number') return null;
  const delta = latest - previous;
  if (Math.abs(delta) < 0.5) return 'Water clarity is similar to the previous sample.';
  if (delta > 0) return 'Water clarity has improved compared with the previous sample.';
  return 'Water clarity is lower than the previous sample.';
}

function phNote(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value >= 6.5 && value <= 8.5) return 'pH is within a typical freshwater range of 6.5–8.5.';
  return 'pH is outside the typical freshwater range of 6.5–8.5.';
}

export function WaterQualityPanel({ lakeId }: { lakeId: string }) {
  const { data, loading, error, reload } = useLakeWaterQuality(lakeId);

  if (loading) return <SkeletonGrid count={3} />;
  if (error) return <ErrorState title="We couldn't load water quality." onRetry={reload} />;
  if (data.length === 0) {
    return (
      <EmptyState
        title="Water quality data has not been published for this lake yet."
        message="Secchi depth, pH, oxygen, and nutrient readings will appear here when a sample is on file."
      />
    );
  }

  const latest = data[0];
  const chart = [...data]
    .map((sample) => ({
      label: toDate(sample.sampleDate)?.getFullYear() ?? sample.year,
      secchi: sample.secchiDepthFt,
      pH: sample.pH,
      oxygen: sample.dissolvedO2,
    }))
    .reverse();
  const clarity = clarityNote(data);
  const acidity = phNote(latest.pH);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <DataFreshnessBadge date={latest.sampleDate} prefix="Sampled" />
        <span className="text-xs text-castiq-muted">Source · {latest.testedBy || 'Unattributed'}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Secchi depth" value={numberOrDash(latest.secchiDepthFt)} detail="feet of water clarity" />
        <MetricCard label="pH" value={numberOrDash(latest.pH, 2)} detail={acidity ?? undefined} />
        <MetricCard label="Dissolved oxygen" value={numberOrDash(latest.dissolvedO2)} detail="mg/L" />
        <MetricCard label="Phosphorus" value={numberOrDash(latest.phosphorusMgL, 3)} detail="mg/L" />
        <MetricCard label="Turbidity" value={latest.turbidity ? latest.turbidity : 'No recent data'} />
        <MetricCard
          label="Algae"
          value={latest.algaePresent ? latest.algaeType || 'Present' : 'None recorded'}
          detail={typeof latest.waterTempF === 'number' ? `Water ${latest.waterTempF}°F` : 'Water temperature not recorded'}
        />
      </div>

      {clarity && <p className="text-sm text-castiq-white">{clarity}</p>}

      {chart.length > 1 && (
        <AppCard>
          <h2 className="text-base font-semibold text-castiq-white">Clarity over samples</h2>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid stroke="#0c1f3d" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={11} width={36} />
                <Tooltip contentStyle={{ background: '#0c1f3d', border: '1px solid #1a3a5c', borderRadius: 8 }} />
                <Line type="monotone" dataKey="secchi" name="Secchi (ft)" stroke="#06b6d4" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AppCard>
      )}

      <SourceFooter>
        Readings come from the water quality records loaded for this lake. A single sample does not describe the whole basin.
      </SourceFooter>
    </div>
  );
}
