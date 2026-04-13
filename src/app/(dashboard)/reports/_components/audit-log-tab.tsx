"use client";

import { useCallback, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/csv-export";
import { getAuditLogs, getAuditLogCount } from "@/lib/actions/reports";
import type { AuditAction } from "@/generated/prisma";
import type { AuditLogEntry } from "./types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_BADGE_COLORS,
  AUDIT_ENTITY_OPTIONS,
  AUDIT_ACTION_OPTIONS,
} from "./types";

const PAGE_SIZE = 50;

export function AuditLogTab({
  initialLogs,
  initialCount,
}: {
  initialLogs: AuditLogEntry[];
  initialCount: number;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [page, setPage] = useState(0);
  const [entityFilter, setEntityFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchLogs = useCallback(
    (newPage: number, entity: string, action: string) => {
      startTransition(async () => {
        const filters: {
          entity?: string;
          action?: AuditAction;
          take: number;
          skip: number;
        } = {
          take: PAGE_SIZE,
          skip: newPage * PAGE_SIZE,
        };
        if (entity !== "All") filters.entity = entity;
        if (action !== "All") filters.action = action as AuditAction;

        const [logsResult, countResult] = await Promise.all([
          getAuditLogs(filters),
          getAuditLogCount(filters),
        ]);

        if (logsResult.success) setLogs(logsResult.data);
        if (countResult.success) setTotalCount(countResult.count);
        setPage(newPage);
      });
    },
    [],
  );

  function handleEntityChange(value: string | null) {
    const v = value ?? "All";
    setEntityFilter(v);
    fetchLogs(0, v, actionFilter);
  }

  function handleActionChange(value: string | null) {
    const v = value ?? "All";
    setActionFilter(v);
    fetchLogs(0, entityFilter, v);
  }

  function handleExport() {
    const headers = ["Action", "Entity", "Entity ID", "User", "Details", "Date"];
    const rows = logs.map((log) => [
      AUDIT_ACTION_LABELS[log.action] ?? log.action,
      log.entity,
      log.entityId,
      log.user?.name ?? "System",
      log.details ?? "",
      new Date(log.createdAt).toLocaleString(),
    ]);
    exportToCsv(headers, rows, "audit-log.csv");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Entity
            </label>
            <Select value={entityFilter} onValueChange={handleEntityChange}>
              <SelectTrigger className="w-[140px] rounded-xl border-[#e0e0e0] bg-white/60 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIT_ENTITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Action
            </label>
            <Select value={actionFilter} onValueChange={handleActionChange}>
              <SelectTrigger className="w-[160px] rounded-xl border-[#e0e0e0] bg-white/60 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIT_ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === "All" ? "All" : (AUDIT_ACTION_LABELS[opt] ?? opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[#e0e0e0] text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04]"
          onClick={handleExport}
        >
          Export CSV <Download />
        </Button>
      </div>

      <div
        className={cn(
          "overflow-x-auto rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl",
          isPending && "opacity-60",
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Entity ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#888888]">
                  No audit logs found.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-black/[0.04] transition-colors hover:bg-red-500/[0.02]"
              >
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-lg border px-2 py-0.5 text-xs font-medium",
                      AUDIT_ACTION_BADGE_COLORS[log.action] ??
                        "border-gray-500/20 bg-gray-500/10 text-gray-700",
                    )}
                  >
                    {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#300000]">{log.entity}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#888888]">
                  {log.entityId.length > 12
                    ? `${log.entityId.slice(0, 12)}...`
                    : log.entityId}
                </td>
                <td className="px-4 py-3 text-[#300000]">
                  {log.user?.name ?? "System"}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-[#888888]">
                  {log.details ?? "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[#888888]">
                  {new Date(log.createdAt).toLocaleDateString()}{" "}
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#888888]">
          Page {page + 1} of {totalPages} ({totalCount} total)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#e0e0e0]"
            disabled={page === 0 || isPending}
            onClick={() => fetchLogs(page - 1, entityFilter, actionFilter)}
          >
            <ChevronLeft /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#e0e0e0]"
            disabled={page + 1 >= totalPages || isPending}
            onClick={() => fetchLogs(page + 1, entityFilter, actionFilter)}
          >
            Next <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
