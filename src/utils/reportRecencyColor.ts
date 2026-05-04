export function getPinColor(lastReportDate: Date | null): string {
  if (!lastReportDate) return '#6b7280'; // gray — no reports
  const hoursAgo = (Date.now() - lastReportDate.getTime()) / 3_600_000;
  if (hoursAgo < 48) return '#22c55e';  // green
  if (hoursAgo < 168) return '#eab308'; // yellow
  return '#6b7280';                      // gray
}

export function getConfidenceColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

export function formatReportAge(date: Date): string {
  const hours = (Date.now() - date.getTime()) / 3_600_000;
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
