"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CheckEventItem } from "./types";

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetName: string;
  assetTag: string;
  events: CheckEventItem[];
  isLoading: boolean;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HistoryModal({
  open,
  onOpenChange,
  assetName,
  assetTag,
  events,
  isLoading,
}: HistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            {assetName}
            <span className="ml-2 text-sm font-normal text-[#888888]">
              {assetTag}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-[#888888]">
              Loading history...
            </p>
          ) : events.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white/40 p-6 text-center text-sm text-[#888888]">
              No events recorded for this asset.
            </p>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => {
                const isCheckout = event.type === "CHECK_OUT";
                return (
                  <li
                    key={event.id}
                    className="flex gap-3 rounded-2xl border border-white/80 bg-white/60 p-4 backdrop-blur-sm"
                  >
                    <div className="shrink-0 pt-0.5">
                      {isCheckout ? (
                        <ArrowDownCircle
                          aria-hidden="true"
                          className="size-5 text-amber-600"
                        />
                      ) : (
                        <ArrowUpCircle
                          aria-hidden="true"
                          className="size-5 text-green-600"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            isCheckout
                              ? "rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                              : "rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                          }
                        >
                          {isCheckout ? "Check Out" : "Check In"}
                        </span>
                        <span className="text-sm text-[#555555]">
                          {event.user.name}
                        </span>
                      </div>
                      {event.notes ? (
                        <p className="mt-1 text-sm text-[#888888]">
                          {event.notes}
                        </p>
                      ) : null}
                    </div>
                    <time
                      dateTime={event.timestamp}
                      className="shrink-0 text-xs text-[#888888]"
                    >
                      {formatTimestamp(event.timestamp)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
