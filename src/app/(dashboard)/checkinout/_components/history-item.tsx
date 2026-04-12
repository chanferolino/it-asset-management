"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { CheckEvent, User } from "@/lib/checkinout/types";
import { formatRelativeTime } from "@/lib/checkinout/relative-time";

interface HistoryItemProps {
  event: CheckEvent;
  user: User | null;
}

export function HistoryItem({ event, user }: HistoryItemProps) {
  const isCheckout = event.type === "CHECK_OUT";
  const userLabel = user?.name ?? "unknown user";
  const label = isCheckout
    ? `Checked out to ${userLabel}`
    : `Checked in from ${userLabel}`;

  return (
    <li
      data-testid="history-item"
      data-event-type={event.type}
      className="flex gap-3 rounded-2xl border border-white/80 bg-white/60 p-4 backdrop-blur-sm"
    >
      <div className="shrink-0 pt-0.5">
        {isCheckout ? (
          <ArrowDownCircle
            aria-hidden="true"
            className="size-5 text-[#c80000]"
          />
        ) : (
          <ArrowUpCircle
            aria-hidden="true"
            className="size-5 text-[#555555]"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#300000]">{label}</p>
        {event.notes ? (
          <p className="mt-0.5 text-sm text-[#888888]">{event.notes}</p>
        ) : null}
      </div>
      <time
        data-testid="history-item-timestamp"
        dateTime={event.timestamp}
        title={event.timestamp}
        className="shrink-0 text-xs text-[#888888]"
      >
        {formatRelativeTime(event.timestamp)}
      </time>
    </li>
  );
}
