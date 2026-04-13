"use client";

import Link from "next/link";
import { Clock, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Assignment } from "./types";

interface AssignmentsTableProps {
  assignments: Assignment[];
  onViewHistory: (assignment: Assignment) => void;
  onUnassign: (assignment: Assignment) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AssignmentsTable({
  assignments,
  onViewHistory,
  onUnassign,
}: AssignmentsTableProps) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-black/[0.06]">
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Asset Name
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Asset Tag
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Assigned To
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Department
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Checked Out
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-sm text-[#888888]"
              >
                No active assignments.
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow
                key={assignment.id}
                className="border-b border-black/[0.04]"
              >
                <TableCell>
                  <Link
                    href={`/inventory/${assignment.id}`}
                    className="text-sm font-medium text-[#7b0000] transition-colors hover:text-[#c80000]"
                  >
                    {assignment.name}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-[#555555]">
                  {assignment.tag}
                </TableCell>
                <TableCell className="text-sm text-[#555555]">
                  {assignment.currentAssignee.name}
                </TableCell>
                <TableCell className="text-sm text-[#555555]">
                  {assignment.currentAssignee.department ?? "\u2014"}
                </TableCell>
                <TableCell className="text-sm text-[#888888]">
                  {formatDate(assignment.checkedOutAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onViewHistory(assignment)}
                      title="View history"
                      className="text-[#888888] transition-all hover:bg-red-500/[0.04] hover:text-[#7b0000]"
                    >
                      <Clock aria-hidden="true" />
                      <span className="sr-only">View history</span>
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onUnassign(assignment)}
                      title="Unassign"
                      className="text-[#888888] transition-all hover:bg-red-500/[0.04] hover:text-[#c80000]"
                    >
                      <UserMinus aria-hidden="true" />
                      <span className="sr-only">Unassign</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
