import { getConfidenceColor } from '../../utils/reportRecencyColor';

interface Props {
  score: number;
  label?: string;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceScore({ score, label = 'Confidence', showBar = true, size = 'md' }: Props) {
  const color = getConfidenceColor(score);
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  const numSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className={`${textSizes[size]} text-castiq-muted`}>{label}</span>
        <span
          className={`${numSizes[size]} font-bold tabular-nums`}
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full rounded-full bg-castiq-blue">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}
