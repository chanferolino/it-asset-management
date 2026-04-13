import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TicketsTable } from "@/app/(dashboard)/tickets/_components/tickets-table";
import type { Ticket } from "@/app/(dashboard)/tickets/_components/types";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "t1",
    title: "Laptop not booting",
    description: "Dell XPS 15 won't turn on after update",
    status: "NEW",
    priority: "HIGH",
    createdById: "u1",
    assignedToId: "u2",
    assetId: null,
    resolvedAt: null,
    createdAt: new Date("2026-03-15"),
    updatedAt: new Date("2026-03-15"),
    createdBy: { id: "u1", name: "Alice Johnson" },
    assignedTo: { id: "u2", name: "Bob Smith" },
    ...overrides,
  };
}

const TICKETS: Ticket[] = [
  makeTicket(),
  makeTicket({
    id: "t2",
    title: "Software license expired",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignedToId: null,
    assignedTo: null,
    createdBy: { id: "u3", name: "Charlie Brown" },
    createdAt: new Date("2026-04-01"),
  }),
  makeTicket({
    id: "t3",
    title: "Printer offline",
    status: "RESOLVED",
    priority: "LOW",
    createdBy: { id: "u1", name: "Alice Johnson" },
    assignedTo: { id: "u4", name: "Diana Prince" },
    createdAt: new Date("2026-02-20"),
  }),
  makeTicket({
    id: "t4",
    title: "Server down",
    status: "CLOSED",
    priority: "CRITICAL",
    createdBy: { id: "u5", name: "Eve Wilson" },
    assignedTo: { id: "u2", name: "Bob Smith" },
    createdAt: new Date("2026-01-10"),
  }),
];

describe("TicketsTable", () => {
  it("renders ticket rows with title, status badge, priority badge, created by, and assigned to", () => {
    render(<TicketsTable tickets={TICKETS} onSelectTicket={vi.fn()} />);

    // All data rows rendered (header + 4 data rows)
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(5);

    // Check first ticket row content
    const firstRow = rows[1];
    expect(within(firstRow).getByText("Laptop not booting")).toBeInTheDocument();
    expect(within(firstRow).getByText("New")).toBeInTheDocument();
    expect(within(firstRow).getByText("High")).toBeInTheDocument();
    expect(within(firstRow).getByText("Alice Johnson")).toBeInTheDocument();
    expect(within(firstRow).getByText("Bob Smith")).toBeInTheDocument();
  });

  it("shows em dash for unassigned tickets", () => {
    render(<TicketsTable tickets={TICKETS} onSelectTicket={vi.fn()} />);

    const rows = screen.getAllByRole("row");
    // Second data row (index 2, accounting for header row) has null assignedTo
    const unassignedRow = rows[2];
    const cells = within(unassignedRow).getAllByRole("cell");
    // Assigned To is the 5th column (index 4)
    expect(cells[4]).toHaveTextContent("—");
  });

  it("shows correct status badge text", () => {
    render(<TicketsTable tickets={TICKETS} onSelectTicket={vi.fn()} />);

    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("shows correct priority badge text", () => {
    render(<TicketsTable tickets={TICKETS} onSelectTicket={vi.fn()} />);

    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("calls onSelectTicket when title is clicked", () => {
    const onSelectTicket = vi.fn();
    render(<TicketsTable tickets={TICKETS} onSelectTicket={onSelectTicket} />);

    fireEvent.click(screen.getByText("Laptop not booting"));

    expect(onSelectTicket).toHaveBeenCalledTimes(1);
    expect(onSelectTicket).toHaveBeenCalledWith(TICKETS[0]);
  });

  it("shows empty state when no tickets", () => {
    render(<TicketsTable tickets={[]} onSelectTicket={vi.fn()} />);

    expect(screen.getByText("No tickets found.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows formatted date in Created column", () => {
    render(<TicketsTable tickets={[TICKETS[0]]} onSelectTicket={vi.fn()} />);

    // March 15, 2026 formatted as "Mar 15, 2026"
    expect(screen.getByText("Mar 15, 2026")).toBeInTheDocument();
  });
});
