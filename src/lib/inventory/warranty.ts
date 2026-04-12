export const EXPIRING_SOON_DAYS = 30;

export type WarrantyStatus =
  | "UNDER_WARRANTY"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "NO_WARRANTY";

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string> = {
  UNDER_WARRANTY: "Under warranty",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
  NO_WARRANTY: "No warranty",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDayUTC(date: Date): number {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

export function getWarrantyStatus(
  expiresAt: string | null,
  today: Date,
): WarrantyStatus {
  if (!expiresAt) return "NO_WARRANTY";

  const expiresMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresMs)) return "NO_WARRANTY";

  const todayMs = startOfDayUTC(today);
  const expiresStartMs = startOfDayUTC(new Date(expiresMs));

  if (expiresStartMs < todayMs) return "EXPIRED";

  const thresholdMs = todayMs + EXPIRING_SOON_DAYS * MS_PER_DAY;
  if (expiresStartMs <= thresholdMs) return "EXPIRING_SOON";

  return "UNDER_WARRANTY";
}
