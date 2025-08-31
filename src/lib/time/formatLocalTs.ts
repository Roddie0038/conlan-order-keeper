export function formatLocalTs(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    // Fallback to ISO if formatter fails
    return d.toLocaleString();
  }
}
