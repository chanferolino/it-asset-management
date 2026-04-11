"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_SEVERITY_LABELS,
  type Notification,
} from "@/lib/notifications/types";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const SEVERITY_BADGE_CLASS: Record<Notification["severity"], string> = {
  INFO: "bg-[#f5f5f5] text-[#555555]",
  WARNING: "bg-amber-500/[0.12] text-amber-700",
  CRITICAL: "bg-red-500/[0.12] text-[#c80000]",
};

const SEVERITY_BORDER_CLASS: Record<Notification["severity"], string> = {
  INFO: "border-l-[#e0e0e0]",
  WARNING: "border-l-amber-500",
  CRITICAL: "border-l-[#c80000]",
};

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSeconds = Math.round((then - now) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSeconds / 86400), "day");
  if (abs < 31536000)
    return rtf.format(Math.round(diffSeconds / 2592000), "month");
  return rtf.format(Math.round(diffSeconds / 31536000), "year");
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) {
  const { id, title, body, category, severity, read, createdAt } = notification;
  const isUnread = !read;

  return (
    <article
      data-testid={`notification-item-${id}`}
      data-read={read ? "true" : "false"}
      className={cn(
        "rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl transition-all",
        "border-l-4",
        isUnread ? SEVERITY_BORDER_CLASS[severity] : "border-l-[#e0e0e0]",
        isUnread ? "shadow-sm" : "opacity-80"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                SEVERITY_BADGE_CLASS[severity]
              )}
            >
              {NOTIFICATION_SEVERITY_LABELS[severity]}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              {NOTIFICATION_CATEGORY_LABELS[category]}
            </span>
            {isUnread && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#c80000]">
                Unread
              </span>
            )}
          </div>
          <h3
            className={cn(
              "text-sm font-bold tracking-tight text-[#300000]",
              !isUnread && "font-semibold"
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-[#888888]">{body}</p>
          <p className="text-xs text-[#bbbbbb]">
            <time dateTime={createdAt}>{formatRelativeTime(createdAt)}</time>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {isUnread && (
            <Button
              type="button"
              onClick={() => onMarkAsRead(id)}
              className="rounded-xl border border-[#e0e0e0] bg-transparent px-3 py-1 text-xs text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04]"
            >
              Mark as read
            </Button>
          )}
          <Button
            type="button"
            onClick={() => onDismiss(id)}
            className="rounded-xl border border-[#e0e0e0] bg-transparent px-3 py-1 text-xs text-[#888888] hover:border-[#c80000] hover:bg-red-500/[0.04] hover:text-[#7b0000]"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </article>
  );
}
