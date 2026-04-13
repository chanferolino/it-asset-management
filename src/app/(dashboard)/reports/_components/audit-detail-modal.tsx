"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuditLogEntry } from "./types";
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_BADGE_COLORS } from "./types";

interface AuditDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AuditLogEntry | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDetails(details: string | null): Record<string, string> | null {
  if (!details) return null;
  try {
    return JSON.parse(details);
  } catch {
    return null;
  }
}

export function AuditDetailModal({
  open,
  onOpenChange,
  entry,
}: AuditDetailModalProps) {
  if (!entry) return null;

  const parsed = formatDetails(entry.details);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
            Audit Log Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action badge */}
          <div>
            <span
              className={cn(
                "inline-block rounded-lg border px-3 py-1 text-sm font-medium",
                AUDIT_ACTION_BADGE_COLORS[entry.action] ??
                  "border-gray-500/20 bg-gray-500/10 text-gray-700"
              )}
            >
              {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
            </span>
          </div>

          {/* Details section */}
          <section className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#888888]">Entity</dt>
                <dd className="font-medium text-[#300000]">{entry.entity}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#888888]">Entity ID</dt>
                <dd className="font-mono text-xs text-[#555555]">{entry.entityId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#888888]">User</dt>
                <dd className="text-[#300000]">{entry.user?.name ?? "System"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#888888]">Date</dt>
                <dd className="text-[#555555]">{formatDateTime(entry.createdAt)}</dd>
              </div>
            </dl>
          </section>

          {/* Parsed details */}
          {parsed && (
            <section className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Change Details
              </h3>
              <dl className="space-y-2 text-sm">
                {Object.entries(parsed).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-[#888888]">{key}</dt>
                    <dd className="text-[#300000]">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Raw details fallback */}
          {entry.details && !parsed && (
            <section className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Details
              </h3>
              <p className="whitespace-pre-wrap text-sm text-[#555555]">
                {entry.details}
              </p>
            </section>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
