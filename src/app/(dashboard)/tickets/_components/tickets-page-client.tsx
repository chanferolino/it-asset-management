"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteTicket } from "@/lib/actions/tickets";
import type { Ticket, SimpleUser, TicketStatus } from "./types";
import { STATUS_LABELS } from "./types";
import { TicketsTable } from "./tickets-table";
import { TicketFormModal } from "./ticket-form-modal";
import { TicketDetailModal } from "./ticket-detail-modal";

const STATUS_FILTERS: Array<{ value: TicketStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: STATUS_LABELS.NEW },
  { value: "IN_PROGRESS", label: STATUS_LABELS.IN_PROGRESS },
  { value: "RESOLVED", label: STATUS_LABELS.RESOLVED },
  { value: "CLOSED", label: STATUS_LABELS.CLOSED },
];

interface TicketsPageClientProps {
  tickets: Ticket[];
  users: SimpleUser[];
}

export function TicketsPageClient({ tickets, users }: TicketsPageClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [, startTransition] = useTransition();

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteTicket(deleteTarget.id);
      if (result.success) {
        toast.success("Ticket deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase().trim();
    return tickets.filter((ticket) => {
      if (statusFilter !== "ALL" && ticket.status !== statusFilter) return false;
      if (
        query &&
        !ticket.title.toLowerCase().includes(query) &&
        !ticket.description.toLowerCase().includes(query)
      )
        return false;
      return true;
    });
  }, [tickets, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Tickets
        </h1>
        <p className="mt-2 text-[#888888]">
          View and manage support tickets and requests.
        </p>
      </div>

      {/* Search + New Ticket */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#bbbbbb]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="rounded-xl border border-[#e0e0e0] bg-white/60 pl-9 backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
          />
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-xl bg-[#c80000] text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98]"
        >
          New Ticket <Plus />
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "rounded-xl border border-[#e0e0e0] bg-transparent text-sm text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]",
              statusFilter === filter.value &&
                "border-[#c80000] bg-red-500/[0.08] text-[#c80000]"
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <TicketsTable
        tickets={filteredTickets}
        onSelectTicket={setSelectedTicket}
        onEditTicket={setEditTicket}
        onDeleteTicket={setDeleteTarget}
      />

      {/* Create modal */}
      <TicketFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        users={users}
      />

      {/* Edit modal */}
      {editTicket && (
        <TicketFormModal
          open={!!editTicket}
          onOpenChange={(open) => {
            if (!open) setEditTicket(null);
          }}
          ticket={editTicket}
          users={users}
        />
      )}

      {/* Detail modal */}
      {selectedTicket && (
        <TicketDetailModal
          open={!!selectedTicket}
          onOpenChange={(open) => {
            if (!open) setSelectedTicket(null);
          }}
          ticket={selectedTicket}
          users={users}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete ticket"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
