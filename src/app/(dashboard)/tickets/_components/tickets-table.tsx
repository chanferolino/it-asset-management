"use client";

import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Ticket } from "./types";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  PRIORITY_BADGE_CLASSES,
} from "./types";

interface TicketsTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onEditTicket?: (ticket: Ticket) => void;
  onDeleteTicket?: (ticket: Ticket) => void;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TicketsTable({ tickets, onSelectTicket, onEditTicket, onDeleteTicket }: TicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-3xl border border-white/80 bg-white/70 p-12 text-center shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <p className="text-sm text-[#888888]">No tickets found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e0e0e0]/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Created By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-[#e0e0e0]/40 last:border-0 transition-colors hover:bg-red-500/[0.02]"
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSelectTicket(ticket)}
                    className="cursor-pointer text-left font-medium text-[#7b0000] transition-colors hover:text-[#c80000]"
                  >
                    {ticket.title}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      "rounded-full border-0 text-xs font-medium",
                      STATUS_BADGE_CLASSES[ticket.status]
                    )}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      "rounded-full border-0 text-xs font-medium",
                      PRIORITY_BADGE_CLASSES[ticket.priority]
                    )}
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[#555555]">
                  {ticket.createdBy.name}
                </td>
                <td className="px-4 py-3 text-[#555555]">
                  {ticket.assignedTo?.name ?? (
                    <span className="text-[#bbbbbb]">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#888888]">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {onEditTicket && (
                      <Button
                        type="button"
                        onClick={() => onEditTicket(ticket)}
                        className="size-8 rounded-lg border border-[#e0e0e0] bg-transparent p-0 text-[#888888] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04] hover:text-[#c80000]"
                        title="Edit ticket"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {onDeleteTicket && (
                      <Button
                        type="button"
                        onClick={() => onDeleteTicket(ticket)}
                        className="size-8 rounded-lg border border-[#e0e0e0] bg-transparent p-0 text-[#888888] transition-all hover:border-red-500 hover:bg-red-500/[0.06] hover:text-[#c80000]"
                        title="Delete ticket"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
