import { useState, useEffect } from 'react';
import { useAIRecommendation } from '../../hooks/useAIRecommendation';
import { ConfidenceScore } from '../shared/ConfidenceScore';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { Lake } from '../../types/lake';
import type { WithId } from '../../types/common';

interface Props {
  lake: WithId<Lake>;
  targetSpecies?: string;
  waterTempF?: number;
}

function currentSeason(): 'spring' | 'summer' | 'fall' | 'ice' {
  const month = new Date().getMonth() + 1;
  if (month >= 12 || month <= 2) return 'ice';
  if (month <= 4) return 'spring';
  if (month <= 8) return 'summer';
  return 'fall';
}

export function LurePanel({ lake, targetSpecies = 'walleye', waterTempF = 60 }: Props) {
  const { recommendation, loading, error, fetch } = useAIRecommendation();
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched) return;
    setFetched(true);
    fetch({
      lakeId: lake.id,
      species: targetSpecies,
      season: currentSeason(),
      waterTempF,
      pressureInHg: 29.9,
      windSpeedMph: 8,
      latestReports: [],
      nettingSurveyCPUE: 0,
      lastStockDate: null,
    });
  }, [lake.id, targetSpecies]);

  return (
    <div className="rounded-lg border border-castiq-teal/30 bg-castiq-blue p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-castiq-teal">AI Lure Recommendations</h3>
        <button
          onClick={() => {
            fetch({
              lakeId: lake.id,
              species: targetSpecies,
              season: currentSeason(),
              waterTempF,
              pressureInHg: 29.9,
              windSpeedMph: 8,
              latestReports: [],
              nettingSurveyCPUE: 0,
              lastStockDate: null,
            });
          }}
          className="text-xs text-castiq-muted hover:text-castiq-teal"
        >
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <p className="text-xs text-castiq-muted">
          AI recommendations require a connected Firebase project and Anthropic API key.
        </p>
      )}

      {recommendation && !loading && (
        <>
          <ConfidenceScore
            score={recommendation.overallConfidence}
            label="Overall Confidence"
          />

          <div className="space-y-2">
            {recommendation.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md bg-castiq-blue-dark/50 p-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-castiq-teal/20 text-xs font-bold text-castiq-teal">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-castiq-white">
                      {rec.lure}
                    </span>
                    <span className="text-xs text-castiq-muted">{rec.confidence}%</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-castiq-muted">
                    {rec.color && <span>🎨 {rec.color}</span>}
                    {rec.depthFt > 0 && <span>📏 {rec.depthFt} ft</span>}
                    {rec.technique && <span>⚡ {rec.technique}</span>}
                  </div>
                  {rec.reasoning && (
                    <p className="text-xs text-castiq-muted">{rec.reasoning}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recommendation.summaryNote && (
            <p className="text-xs text-castiq-muted italic">
              {recommendation.summaryNote}
            </p>
          )}
        </>
      )}
    </div>
  );
}
