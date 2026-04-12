"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MOCK_NOTIFICATIONS } from "@/lib/notifications/mock-data";
import type { Notification } from "@/lib/notifications/types";

const SEVERITY_DOT_CLASS: Record<Notification["severity"], string> = {
  INFO: "bg-[#bbbbbb]",
  WARNING: "bg-amber-500",
  CRITICAL: "bg-[#c80000]",
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

interface NotificationsBellProps {
  initialNotifications?: Notification[];
}

export function NotificationsBell({
  initialNotifications = MOCK_NOTIFICATIONS,
}: NotificationsBellProps) {
  // Bell and inbox each maintain independent local copies of the same mock seed.
  // The future backend plan introduces a shared store; this is a deliberate v0 simplification.
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount);
  const showBadge = unreadCount > 0;

  const recent = useMemo(() => {
    return [...notifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [notifications]);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#888888] transition-all hover:bg-red-500/[0.04] hover:text-[#7b0000]"
      >
        <Bell className="h-5 w-5" />
        {showBadge && (
          <span
            data-testid="bell-badge"
            aria-label={`${unreadCount} unread notifications`}
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c80000] px-1 text-[10px] font-semibold text-white"
          >
            {badgeText}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 rounded-2xl border border-white/80 bg-white/80 p-0 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
          <span className="text-sm font-bold tracking-tight text-[#300000]">
            Notifications
          </span>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-semibold uppercase tracking-wide text-[#7b0000] hover:text-[#c80000] disabled:cursor-not-allowed disabled:text-[#bbbbbb]"
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto" data-testid="bell-list">
          {recent.length === 0 ? (
            <div
              data-testid="bell-empty-state"
              className="px-4 py-8 text-center text-sm text-[#888888]"
            >
              No notifications.
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.04]">
              {recent.map((n) => (
                <li
                  key={n.id}
                  data-testid={`bell-item-${n.id}`}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      n.read ? "bg-transparent" : SEVERITY_DOT_CLASS[n.severity]
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm text-[#300000]",
                        n.read ? "font-normal" : "font-semibold"
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-[#888888]">
                      <time dateTime={n.createdAt}>
                        {formatRelativeTime(n.createdAt)}
                      </time>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-black/[0.06] px-4 py-2">
          <Link
            href="/notifications/inbox"
            className="block text-center text-xs font-semibold uppercase tracking-wide text-[#7b0000] hover:text-[#c80000]"
          >
            View all
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
