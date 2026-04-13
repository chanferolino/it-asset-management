function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function exportToCsv(
  headers: string[],
  rows: string[][],
  filename: string,
): void {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\n");
  const csv = `${headerLine}\n${dataLines}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
