"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TicketsTable({ tickets, onSelectTicket }: TicketsTableProps) {
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
                    className="text-left font-medium text-[#300000] hover:text-[#c80000] transition-colors"
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
