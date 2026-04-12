const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface FormatOptions {
  fallback?: string;
}

export function formatCurrency(
  cents: number | null,
  opts: FormatOptions = {},
): string {
  if (cents === null || cents === undefined) return opts.fallback ?? "—";
  return CURRENCY_FORMATTER.format(cents / 100);
}

export function formatDate(
  iso: string | null,
  opts: FormatOptions = {},
): string {
  if (!iso) return opts.fallback ?? "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return opts.fallback ?? "—";
  return DATE_FORMATTER.format(new Date(ms));
}

function startOfDayUTC(date: Date): number {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

export function formatRelativeDays(iso: string, today: Date): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  const targetMs = startOfDayUTC(new Date(ms));
  const todayMs = startOfDayUTC(today);
  const diffDays = Math.round((targetMs - todayMs) / MS_PER_DAY);

  if (diffDays === 0) return "today";
  if (diffDays > 0) {
    return diffDays === 1 ? "in 1 day" : `in ${diffDays} days`;
  }
  const absDays = Math.abs(diffDays);
  return absDays === 1 ? "1 day ago" : `${absDays} days ago`;
}
