"use client";

import type { CheckEvent, User } from "@/lib/checkinout/types";
import { HistoryItem } from "./history-item";

interface HistoryListProps {
  events: CheckEvent[];
  users: User[];
  hasSelectedAsset: boolean;
}

export function HistoryList({
  events,
  users,
  hasSelectedAsset,
}: HistoryListProps) {
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <section
      data-testid="history-list"
      className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[#300000]">
          History
        </h2>
        {hasSelectedAsset ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        ) : null}
      </div>

      {!hasSelectedAsset ? (
        <p
          data-testid="history-empty-no-selection"
          className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white/40 p-6 text-center text-sm text-[#888888]"
        >
          Look up an asset to see its history.
        </p>
      ) : events.length === 0 ? (
        <p
          data-testid="history-empty-no-events"
          className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white/40 p-6 text-center text-sm text-[#888888]"
        >
          No check-in/out events recorded for this asset yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <HistoryItem
              key={event.id}
              event={event}
              user={userById.get(event.userId) ?? null}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
