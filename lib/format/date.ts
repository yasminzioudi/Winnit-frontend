/**
 * Formats a date string or Date object into French format (e.g. 27 Oct 2026)
 */
export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-TN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Returns a short timestamp (e.g. 14:32)
 */
export function formatTime(date: string | Date | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-TN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
