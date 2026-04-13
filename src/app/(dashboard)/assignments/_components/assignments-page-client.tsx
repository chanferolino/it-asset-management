"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  getAssignmentHistory,
  unassignAsset,
} from "@/lib/actions/assignments";
import type {
  Assignment,
  CheckEventItem,
  DepartmentAllocation,
} from "./types";
import { DepartmentSummary } from "./department-summary";
import { AssignmentsTable } from "./assignments-table";
import { HistoryModal } from "./history-modal";

interface AssignmentsPageClientProps {
  assignments: Assignment[];
  departmentAllocations: DepartmentAllocation[];
}

export function AssignmentsPageClient({
  assignments,
  departmentAllocations,
}: AssignmentsPageClientProps) {
  const [search, setSearch] = useState("");
  const [historyAsset, setHistoryAsset] = useState<Assignment | null>(null);
  const [historyEvents, setHistoryEvents] = useState<CheckEventItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<Assignment | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = search.trim()
    ? assignments.filter((a) => {
        const term = search.trim().toLowerCase();
        return (
          a.name.toLowerCase().includes(term) ||
          a.tag.toLowerCase().includes(term) ||
          a.currentAssignee.name.toLowerCase().includes(term)
        );
      })
    : assignments;

  async function handleViewHistory(assignment: Assignment) {
    setHistoryAsset(assignment);
    setHistoryLoading(true);
    setHistoryEvents([]);

    try {
      const events = await getAssignmentHistory(assignment.id);
      setHistoryEvents(
        events.map((e) => ({
          id: e.id,
          type: e.type as "CHECK_OUT" | "CHECK_IN",
          timestamp: e.timestamp.toISOString(),
          notes: e.notes,
          user: e.user,
        }))
      );
    } catch {
      toast.error("Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleUnassignConfirm() {
    if (!unassignTarget) return;

    startTransition(async () => {
      const result = await unassignAsset(unassignTarget.id);
      if (result.success) {
        toast.success(`${unassignTarget.name} has been unassigned.`);
      } else {
        toast.error(result.error);
      }
      setUnassignTarget(null);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Assignments
        </h1>
        <p className="mt-2 text-[#888888]">
          Track device-to-user assignments and checkout history.
        </p>
      </div>

      <DepartmentSummary allocations={departmentAllocations} />

      <div className="relative max-w-sm">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#bbbbbb]"
        />
        <Input
          type="search"
          placeholder="Search by name, tag, or assignee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-[#e0e0e0] bg-white/60 pl-9 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
        />
      </div>

      <AssignmentsTable
        assignments={filtered}
        onViewHistory={handleViewHistory}
        onUnassign={setUnassignTarget}
      />

      <HistoryModal
        open={historyAsset !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryAsset(null);
        }}
        assetName={historyAsset?.name ?? ""}
        assetTag={historyAsset?.tag ?? ""}
        events={historyEvents}
        isLoading={historyLoading}
      />

      <ConfirmDialog
        open={unassignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUnassignTarget(null);
        }}
        title="Unassign asset?"
        description={`Remove ${unassignTarget?.currentAssignee.name ?? "this user"} from ${unassignTarget?.name ?? "this asset"}? The asset will be marked as available.`}
        confirmLabel="Unassign"
        cancelLabel="Cancel"
        onConfirm={handleUnassignConfirm}
        isLoading={isPending}
      />
    </div>
  );
}
