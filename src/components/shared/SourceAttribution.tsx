interface Props {
  sourceName: string;
  credibilityScore?: number;
  url?: string;
  type?: 'RSS' | 'API' | 'scrape' | 'user';
}

const TYPE_COLORS: Record<string, string> = {
  RSS: 'bg-blue-900/50 text-blue-300',
  API: 'bg-purple-900/50 text-purple-300',
  scrape: 'bg-yellow-900/50 text-yellow-300',
  user: 'bg-green-900/50 text-green-300',
};

export function SourceAttribution({ sourceName, credibilityScore, url, type = 'RSS' }: Props) {
  const colorClass = TYPE_COLORS[type] ?? TYPE_COLORS.RSS;

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}>
        {type}
      </span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-castiq-teal hover:underline"
        >
          {sourceName}
        </a>
      ) : (
        <span className="text-xs text-castiq-muted">{sourceName}</span>
      )}
      {credibilityScore !== undefined && (
        <span className="text-xs text-castiq-muted">·&nbsp;{credibilityScore}% credible</span>
      )}
    </div>
  );
}
