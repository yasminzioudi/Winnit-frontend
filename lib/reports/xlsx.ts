export async function downloadXLSX(
  filename: string,
  sheets: { name: string; rows: string[][] }[]
): Promise<void> {
  // Dynamic import to avoid bundling xlsx in first load
  const XLSX = await import('xlsx');

  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  XLSX.writeFile(workbook, filename);
}

export function generateXLSXFilename(type: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `winnit-${type}-${date}.xlsx`;
}
