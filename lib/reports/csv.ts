/**
 * RFC 4180 CSV escaping:
 * - Fields containing comma, quote, or newline must be quoted
 * - Quotes inside fields are escaped by doubling them
 * - UTF-8 BOM for Excel compatibility with accents
 */

export function escapeCSVField(field: string): string {
  const needsQuoting = /[",\n\r]/.test(field);
  if (!needsQuoting) {
    return field;
  }
  const escaped = field.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function rowsToCSV(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCSVField).join(',')).join('\n');
}

export function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rowsToCSV(rows);
  // Add UTF-8 BOM for Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  URL.revokeObjectURL(link.href);
}

export function generateCSVFilename(type: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `winnit-${type}-${date}.csv`;
}
