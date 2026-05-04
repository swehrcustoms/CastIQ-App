import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { ConfidenceScore } from '../shared/ConfidenceScore';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { formatReportAge } from '../../utils/reportRecencyColor';

interface LiveIntelligence {
  brief: string;
  topSpecies: string[];
  topLures: string[];
  conditions: string;
  confidenceScore: number;
  lastReportAge: string;
  sourceCount: number;
  cached?: boolean;
  generatedAt?: { toDate?: () => Date };
}

interface Props {
  lakeId: string;
  lakeName: string;
}

const liveIntelligenceFn = httpsCallable<
  { lakeId: string; forceRefresh: boolean },
  LiveIntelligence
>(functions, 'liveIntelligenceService');

export function AIReportEngine({ lakeId, lakeName }: Props) {
  const [data, setData] = useState<LiveIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchIntelligence = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await liveIntelligenceFn({ lakeId, forceRefresh });
      setData(result.data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch intelligence'));
    } finally {
      setLoading(false);
    }
  }, [lakeId]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-castiq-white">Live Intelligence</h2>
          <p className="text-xs text-castiq-muted">{lakeName}</p>
        </div>
        <button
          onClick={() => fetchIntelligence(true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-castiq-teal px-4 py-2 text-sm font-medium text-castiq-blue-dark hover:bg-castiq-teal/80 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : '↻'}
          Refresh
        </button>
      </div>

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="flex flex-col items-center gap-4 rounded-lg bg-castiq-blue p-8 text-center">
          <div className="text-4xl">🎣</div>
          <div>
            <p className="font-medium text-castiq-white">No intelligence loaded</p>
            <p className="mt-1 text-sm text-castiq-muted">
              Click Refresh to synthesize live fishing reports for {lakeName}
            </p>
          </div>
          <button
            onClick={() => fetchIntelligence(false)}
            className="rounded-lg bg-castiq-teal px-6 py-2 text-sm font-medium text-castiq-blue-dark hover:bg-castiq-teal/80"
          >
            Load Intelligence
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-castiq-blue p-8">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-castiq-muted">Synthesizing reports with Claude AI…</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/20 p-4 text-sm text-red-300">
          {error.message}. Ensure Firebase Functions are deployed and Anthropic API key is configured.
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {/* Confidence + metadata */}
          <div className="rounded-lg bg-castiq-blue p-4 space-y-3">
            <ConfidenceScore score={data.confidenceScore} size="lg" />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-castiq-muted">
              <span>{data.sourceCount} source{data.sourceCount !== 1 ? 's' : ''} analyzed</span>
              {lastRefreshed && (
                <span>Updated {formatReportAge(lastRefreshed)}</span>
              )}
              {data.cached && <span>· Cached (4h TTL)</span>}
            </div>
          </div>

          {/* Intelligence brief */}
          {data.brief && (
            <div className="rounded-lg border border-castiq-teal/30 bg-castiq-blue p-4">
              <h3 className="mb-2 text-sm font-semibold text-castiq-teal">Intelligence Brief</h3>
              <p className="text-sm text-castiq-white leading-relaxed">{data.brief}</p>
            </div>
          )}

          {/* Species + Lures */}
          <div className="grid gap-4 sm:grid-cols-2">
            {data.topSpecies.length > 0 && (
              <div className="rounded-lg bg-castiq-blue p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-castiq-muted">
                  Active Species
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.topSpecies.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-castiq-teal/20 px-3 py-1 text-xs font-medium text-castiq-teal capitalize"
                    >
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.topLures.length > 0 && (
              <div className="rounded-lg bg-castiq-blue p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-castiq-muted">
                  Working Lures
                </h3>
                <ul className="space-y-1">
                  {data.topLures.map((l) => (
                    <li key={l} className="text-sm text-castiq-white">
                      🎣 {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Conditions */}
          {data.conditions && (
            <div className="rounded-lg bg-castiq-blue p-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-castiq-muted">
                Conditions
              </h3>
              <p className="text-sm text-castiq-white">{data.conditions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
