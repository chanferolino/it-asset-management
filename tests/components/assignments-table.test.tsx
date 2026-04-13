import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Assignment } from "@/app/(dashboard)/assignments/_components/types";

vi.mock("@/lib/actions/assignments");

const ASSIGNMENTS: Assignment[] = [
  {
    id: "a_001",
    tag: "IT-0001",
    name: "MacBook Pro 16",
    category: "LAPTOP",
    status: "ASSIGNED",
    currentAssignee: {
      id: "u_001",
      name: "Sara Patel",
      email: "sara@example.com",
      department: "Engineering",
    },
    checkedOutAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "a_002",
    tag: "IT-0002",
    name: "Dell Monitor 27",
    category: "MONITOR",
    status: "ASSIGNED",
    currentAssignee: {
      id: "u_002",
      name: "John Lee",
      email: "john@example.com",
      department: null,
    },
    checkedOutAt: null,
  },
];

// Dynamic import to avoid next-auth issues after vi.mock
const { AssignmentsTable } = await import(
  "@/app/(dashboard)/assignments/_components/assignments-table"
);

describe("AssignmentsTable", () => {
  it("renders rows with asset name, tag, assignee, department, and checked out date", () => {
    render(
      <AssignmentsTable
        assignments={ASSIGNMENTS}
        onViewHistory={vi.fn()}
        onUnassign={vi.fn()}
      />,
    );

    expect(screen.getByText("MacBook Pro 16")).toBeInTheDocument();
    expect(screen.getByText("IT-0001")).toBeInTheDocument();
    expect(screen.getByText("Sara Patel")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Mar 15, 2026")).toBeInTheDocument();

    expect(screen.getByText("Dell Monitor 27")).toBeInTheDocument();
    expect(screen.getByText("IT-0002")).toBeInTheDocument();
    expect(screen.getByText("John Lee")).toBeInTheDocument();
  });

  it("shows dash for null department", () => {
    render(
      <AssignmentsTable
        assignments={[ASSIGNMENTS[1]]}
        onViewHistory={vi.fn()}
        onUnassign={vi.fn()}
      />,
    );

    // The \u2014 em-dash is used for null department and null checkedOutAt
    const dashes = screen.getAllByText("\u2014");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onViewHistory when history button is clicked", () => {
    const onViewHistory = vi.fn();

    render(
      <AssignmentsTable
        assignments={[ASSIGNMENTS[0]]}
        onViewHistory={onViewHistory}
        onUnassign={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view history/i }));

    expect(onViewHistory).toHaveBeenCalledTimes(1);
    expect(onViewHistory).toHaveBeenCalledWith(ASSIGNMENTS[0]);
  });

  it("calls onUnassign when unassign button is clicked", () => {
    const onUnassign = vi.fn();

    render(
      <AssignmentsTable
        assignments={[ASSIGNMENTS[0]]}
        onViewHistory={vi.fn()}
        onUnassign={onUnassign}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /unassign/i }));

    expect(onUnassign).toHaveBeenCalledTimes(1);
    expect(onUnassign).toHaveBeenCalledWith(ASSIGNMENTS[0]);
  });

  it("shows empty state when no assignments", () => {
    render(
      <AssignmentsTable
        assignments={[]}
        onViewHistory={vi.fn()}
        onUnassign={vi.fn()}
      />,
    );

    expect(screen.getByText("No active assignments.")).toBeInTheDocument();
  });
});
