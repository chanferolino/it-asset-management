"use client";

import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateTicket, deleteTicket } from "@/lib/actions/tickets";
import type { Ticket, SimpleUser, TicketStatus } from "./types";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  PRIORITY_BADGE_CLASSES,
} from "./types";
import { TicketFormModal } from "./ticket-form-modal";

interface TicketDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  users: SimpleUser[];
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TicketDetailModal({
  open,
  onOpenChange,
  ticket,
  users,
}: TicketDetailModalProps) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleStatusChange(status: TicketStatus) {
    const result = await updateTicket(ticket.id, { status });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`Ticket ${STATUS_LABELS[status].toLowerCase()}`);
    onOpenChange(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket? This action cannot be undone."
    );
    if (!confirmed) return;

    const result = await deleteTicket(ticket.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Ticket deleted");
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
              {ticket.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status & Priority */}
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full border-0 text-xs font-medium",
                  STATUS_BADGE_CLASSES[ticket.status]
                )}
              >
                {STATUS_LABELS[ticket.status]}
              </Badge>
              <Badge
                className={cn(
                  "rounded-full border-0 text-xs font-medium",
                  PRIORITY_BADGE_CLASSES[ticket.priority]
                )}
              >
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
            </div>

            {/* Description */}
            <section className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#555555]">
                {ticket.description}
              </p>
            </section>

            {/* Details */}
            <section className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Details
              </h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Created by</dt>
                  <dd className="text-[#555555]">{ticket.createdBy.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Assigned to</dt>
                  <dd className="text-[#555555]">
                    {ticket.assignedTo?.name ?? (
                      <span className="text-[#bbbbbb]">Unassigned</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Created</dt>
                  <dd className="text-[#555555]">
                    {formatDateTime(ticket.createdAt)}
                  </dd>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex justify-between">
                    <dt className="text-[#888888]">Resolved</dt>
                    <dd className="text-[#555555]">
                      {formatDateTime(ticket.resolvedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              {ticket.status === "NEW" && (
                <Button
                  type="button"
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                  className="rounded-xl bg-[#c80000] text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98]"
                >
                  Start Progress
                </Button>
              )}

              {ticket.status === "IN_PROGRESS" && (
                <>
                  <Button
                    type="button"
                    onClick={() => handleStatusChange("RESOLVED")}
                    className="rounded-xl bg-green-600 text-white transition-all hover:bg-green-700 active:bg-green-800 active:scale-[0.98]"
                  >
                    Resolve
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleStatusChange("NEW")}
                    className="rounded-xl border border-[#e0e0e0] bg-transparent text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
                  >
                    Reopen
                  </Button>
                </>
              )}

              {ticket.status === "RESOLVED" && (
                <>
                  <Button
                    type="button"
                    onClick={() => handleStatusChange("CLOSED")}
                    className="rounded-xl border border-[#e0e0e0] bg-transparent text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleStatusChange("NEW")}
                    className="rounded-xl border border-[#e0e0e0] bg-transparent text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
                  >
                    Reopen
                  </Button>
                </>
              )}

              {ticket.status === "CLOSED" && (
                <Button
                  type="button"
                  onClick={() => handleStatusChange("NEW")}
                  className="rounded-xl border border-[#e0e0e0] bg-transparent text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
                >
                  Reopen
                </Button>
              )}
            </div>

            {/* Edit & Delete */}
            <div className="flex justify-end gap-2 border-t border-[#e0e0e0]/60 pt-4">
              <Button
                type="button"
                onClick={() => setEditOpen(true)}
                className="rounded-xl bg-[#c80000] text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98]"
              >
                Edit
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                className="rounded-xl border border-[#e0e0e0] bg-transparent text-red-600 transition-all hover:border-red-500 hover:bg-red-500/[0.04]"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TicketFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        ticket={ticket}
        users={users}
      />
    </>
  );
}
