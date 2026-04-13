"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/csv-export";
import type { AssetReport } from "./types";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-500/10 text-green-700",
  ASSIGNED: "bg-blue-500/10 text-blue-700",
  IN_REPAIR: "bg-amber-500/10 text-amber-700",
  RETIRED: "bg-gray-500/10 text-gray-700",
};

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AssetReportTab({ report }: { report: AssetReport }) {
  function handleExport() {
    const headers = ["Type", "Name", "Count"];
    const rows = [
      ...report.byStatus.map((s) => ["Status", formatLabel(s.status), String(s.count)]),
      ...report.byCategory.map((c) => ["Category", formatLabel(c.category), String(c.count)]),
    ];
    exportToCsv(headers, rows, "asset-report.csv");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight text-[#300000]">
          Asset Report
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
          By Category
        </h4>
        <div className="flex flex-wrap gap-4">
          {report.byCategory.map(({ category, count }) => (
            <div
              key={category}
              className={cn(
                "min-w-[140px] flex-1 rounded-3xl border border-white/80 bg-white/70 p-5 shadow-xl shadow-black/[0.08] backdrop-blur-xl",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                {formatLabel(category)}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#300000]">
                {count}
              </p>
            </div>
          ))}
          {report.byCategory.length === 0 && (
            <p className="text-sm text-[#888888]">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
