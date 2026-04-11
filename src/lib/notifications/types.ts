export type NotificationCategory =
  | "SYSTEM"
  | "SECURITY"
  | "MAINTENANCE"
  | "WARRANTY";

export type NotificationSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  read: boolean;
  createdAt: string;
  link?: string;
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "SYSTEM",
  "SECURITY",
  "MAINTENANCE",
  "WARRANTY",
];

export const NOTIFICATION_SEVERITIES: NotificationSeverity[] = [
  "INFO",
  "WARNING",
  "CRITICAL",
];

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  SYSTEM: "System",
  SECURITY: "Security",
  MAINTENANCE: "Maintenance",
  WARRANTY: "Warranty",
};

export const NOTIFICATION_SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  INFO: "Info",
  WARNING: "Warning",
  CRITICAL: "Critical",
};
