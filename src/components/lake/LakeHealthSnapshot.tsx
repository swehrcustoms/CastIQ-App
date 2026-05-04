import type { Lake } from '../../types/lake';
import type { WithId } from '../../types/common';
import { formatReportAge } from '../../utils/reportRecencyColor';

interface Props {
  lake: WithId<Lake>;
}

function HealthRow({ label, value, status }: { label: string; value: string; status?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const colors = {
    good: 'text-castiq-green',
    warn: 'text-castiq-yellow',
    bad: 'text-castiq-red',
    neutral: 'text-castiq-white',
  };
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-castiq-muted">{label}</span>
      <span className={colors[status ?? 'neutral'] ?? colors.neutral}>{value}</span>
    </div>
  );
}

export function LakeHealthSnapshot({ lake }: Props) {
  const lastReport = lake.lastReportDate
    ? (lake.lastReportDate as unknown as { toDate?: () => Date }).toDate?.()
    : null;
  const lastSurvey = lake.lastSurveyDate
    ? (lake.lastSurveyDate as unknown as { toDate?: () => Date }).toDate?.()
    : null;
  const lastStock = lake.lastStockDate
    ? (lake.lastStockDate as unknown as { toDate?: () => Date }).toDate?.()
    : null;

  return (
    <div className="rounded-lg bg-castiq-blue p-4 space-y-3">
      <h3 className="text-sm font-semibold text-castiq-white">Lake Health Snapshot</h3>
      <div className="space-y-2">
        <HealthRow
          label="Reports this week"
          value={`${lake.reportCount7d ?? 0}`}
          status={
            (lake.reportCount7d ?? 0) >= 3
              ? 'good'
              : (lake.reportCount7d ?? 0) >= 1
                ? 'warn'
                : 'neutral'
          }
        />
        <HealthRow
          label="Last angler report"
          value={lastReport ? formatReportAge(lastReport) : 'No reports'}
          status={
            lastReport && (Date.now() - lastReport.getTime()) / 3_600_000 < 48
              ? 'good'
              : 'neutral'
          }
        />
        <HealthRow
          label="Last DNR survey"
          value={lastSurvey ? lastSurvey.getFullYear().toString() : 'Unknown'}
          status="neutral"
        />
        <HealthRow
          label="Last stocked"
          value={lastStock ? lastStock.getFullYear().toString() : 'Unknown'}
          status="neutral"
        />
        <HealthRow
          label="AIS status"
          value={
            lake.AISPresent && lake.AISPresent.length > 0
              ? lake.AISPresent.join(', ')
              : 'None detected'
          }
          status={lake.AISPresent && lake.AISPresent.length > 0 ? 'bad' : 'good'}
        />
        <HealthRow
          label="Management"
          value={lake.managementClass ?? 'Standard'}
          status="neutral"
        />
      </div>
    </div>
  );
}
