import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { HistoryList } from "@/app/(dashboard)/checkinout/_components/history-list";
import type { CheckEvent, User } from "@/lib/checkinout/types";

const USERS: User[] = [
  {
    id: "u_001",
    name: "Sara Patel",
    email: "sara@example.com",
    department: "Engineering",
  },
  {
    id: "u_002",
    name: "Marco Reyes",
    email: "marco@example.com",
    department: "Design",
  },
];

const EVENTS: CheckEvent[] = [
  {
    id: "e_new",
    assetId: "a_001",
    type: "CHECK_IN",
    userId: "u_002",
    timestamp: "2026-04-10T12:00:00.000Z",
    notes: "Returned with cracked screen",
  },
  {
    id: "e_mid",
    assetId: "a_001",
    type: "CHECK_OUT",
    userId: "u_002",
    timestamp: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "e_old",
    assetId: "a_001",
    type: "CHECK_OUT",
    userId: "u_001",
    timestamp: "2026-01-10T09:00:00.000Z",
  },
];

describe("HistoryList", () => {
  it("renders one row per event in the order provided", () => {
    render(<HistoryList events={EVENTS} users={USERS} hasSelectedAsset />);
    const items = screen.getAllByTestId("history-item");
    expect(items).toHaveLength(3);
    // First row is the check-in by Marco Reyes
    expect(items[0]).toHaveAttribute("data-event-type", "CHECK_IN");
    expect(
      within(items[0]).getByText(/Checked in from Marco Reyes/),
    ).toBeInTheDocument();
    // Notes render when present
    expect(
      within(items[0]).getByText(/Returned with cracked screen/),
    ).toBeInTheDocument();
  });

  it("renders a CHECK_OUT row with the 'Checked out to' label", () => {
    render(<HistoryList events={[EVENTS[1]]} users={USERS} hasSelectedAsset />);
    expect(screen.getByText(/Checked out to Marco Reyes/)).toBeInTheDocument();
  });

  it("renders the no-selection empty state when hasSelectedAsset is false", () => {
    render(<HistoryList events={[]} users={USERS} hasSelectedAsset={false} />);
    expect(
      screen.getByTestId("history-empty-no-selection"),
    ).toHaveTextContent(/look up an asset/i);
    expect(screen.queryByTestId("history-item")).not.toBeInTheDocument();
  });

  it("renders the no-events empty state when selection exists but events array is empty", () => {
    render(<HistoryList events={[]} users={USERS} hasSelectedAsset />);
    expect(
      screen.getByTestId("history-empty-no-events"),
    ).toHaveTextContent(/no check-in\/out events recorded/i);
  });

  it("renders 'unknown user' when the event's userId cannot be resolved", () => {
    const orphan: CheckEvent = {
      id: "orphan",
      assetId: "a_001",
      type: "CHECK_OUT",
      userId: "nonexistent",
      timestamp: "2026-04-01T00:00:00.000Z",
    };
    render(<HistoryList events={[orphan]} users={USERS} hasSelectedAsset />);
    expect(
      screen.getByText(/Checked out to unknown user/),
    ).toBeInTheDocument();
  });

  it("exposes the ISO timestamp via the time element's title attribute", () => {
    render(<HistoryList events={[EVENTS[0]]} users={USERS} hasSelectedAsset />);
    const timeEl = screen.getByTestId("history-item-timestamp");
    expect(timeEl).toHaveAttribute("title", "2026-04-10T12:00:00.000Z");
    expect(timeEl).toHaveAttribute("datetime", "2026-04-10T12:00:00.000Z");
  });
});
