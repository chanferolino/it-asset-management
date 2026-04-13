"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/csv-export";
import type { TicketReport } from "./types";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-700",
  IN_PROGRESS: "bg-amber-500/10 text-amber-700",
  RESOLVED: "bg-green-500/10 text-green-700",
  CLOSED: "bg-gray-500/10 text-gray-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-green-500/10 text-green-700",
  MEDIUM: "bg-amber-500/10 text-amber-700",
  HIGH: "bg-orange-500/10 text-orange-700",
  CRITICAL: "bg-red-500/10 text-red-700",
};

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TicketReportTab({ report }: { report: TicketReport }) {
  function handleExport() {
    const headers = ["Type", "Name", "Count"];
    const rows = [
      ...report.byStatus.map((s) => ["Status", formatLabel(s.status), String(s.count)]),
      ...report.byPriority.map((p) => ["Priority", formatLabel(p.priority), String(p.count)]),
      ["Metric", "Avg Resolution Time (hrs)", String(report.avgResolutionHours ?? "N/A")],
    ];
    exportToCsv(headers, rows, "ticket-report.csv");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight text-[#300000]">
          Ticket Metrics
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[#e0e0e0] text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04]"
          onClick={handleExport}
        >
          Export CSV <Download />
        </Button>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#555555]">
          By Status
        </h4>
        <div className="flex flex-wrap gap-4">
          {report.byStatus.map(({ status, count }) => (
            <div
              key={status}
              className={cn(
                "min-w-[140px] flex-1 rounded-3xl border border-white/80 bg-white/70 p-5 shadow-xl shadow-black/[0.08] backdrop-blur-xl",
              )}
            >
              <span
                className={cn(
                  "inline-block rounded-lg px-2 py-0.5 text-xs font-medium",
                  STATUS_COLORS[status] ?? "bg-gray-500/10 text-gray-700",
                )}
              >
                {formatLabel(status)}
              </span>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#300000]">
                {count}
              </p>
            </div>
          ))}
          {report.byStatus.length === 0 && (
            <p className="text-sm text-[#888888]">No data available.</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#555555]">
          By Priority
        </h4>
        <div className="flex flex-wrap gap-4">
          {report.byPriority.map(({ priority, count }) => (
            <div
              key={priority}
              className={cn(
                "min-w-[140px] flex-1 rounded-3xl border border-white/80 bg-white/70 p-5 shadow-xl shadow-black/[0.08] backdrop-blur-xl",
              )}
            >
              <span
                className={cn(
                  "inline-block rounded-lg px-2 py-0.5 text-xs font-medium",
                  PRIORITY_COLORS[priority] ?? "bg-gray-500/10 text-gray-700",
                )}
              >
                {formatLabel(priority)}
              </span>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#300000]">
                {count}
              </p>
            </div>
          ))}
          {report.byPriority.length === 0 && (
            <p className="text-sm text-[#888888]">No data available.</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#555555]">
          Average Resolution Time
        </h4>
        <div className="inline-block rounded-3xl border border-[#c80000]/20 bg-red-500/[0.06] p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Hours
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[#c80000]">
            {report.avgResolutionHours ?? "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
