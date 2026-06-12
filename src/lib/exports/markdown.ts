export function mdHeading(level: 1 | 2 | 3, text: string): string {
  return `${"#".repeat(level)} ${text}\n\n`;
}

export function mdList(items: string[]): string {
  if (!items.length) {
    return "_None_\n\n";
  }

  return `${items.map((item) => `- ${item}`).join("\n")}\n\n`;
}

export function mdKeyValue(rows: Array<[string, string | number | null | undefined]>): string {
  return `${rows
    .map(([key, value]) => `- **${key}:** ${value ?? "—"}`)
    .join("\n")}\n\n`;
}

export function mdTable(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): string {
  const headerLine = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows
    .map((row) => `| ${row.map((cell) => String(cell ?? "—")).join(" | ")} |`)
    .join("\n");

  return `${headerLine}\n${divider}\n${body}\n\n`;
}

export function formatExportDate(iso: string): string {
  return iso.slice(0, 10);
}

export function buildExportFilename(
  prefix: string,
  suffix?: string,
  now: Date = new Date(),
): string {
  const date = formatExportDate(now.toISOString());
  return suffix ? `${prefix}-${suffix}-${date}.md` : `${prefix}-${date}.md`;
}

export function truncateText(text: string, max = 240): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
}
