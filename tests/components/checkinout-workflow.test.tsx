import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockLookupAsset = vi.fn();
const mockCheckOutAsset = vi.fn();
const mockCheckInAsset = vi.fn();
const mockGetActiveUsers = vi.fn();

vi.mock("@/lib/actions/checkinout", () => ({
  lookupAsset: (...args: unknown[]) => mockLookupAsset(...args),
  getActiveUsers: (...args: unknown[]) => mockGetActiveUsers(...args),
  checkOutAsset: (...args: unknown[]) => mockCheckOutAsset(...args),
  checkInAsset: (...args: unknown[]) => mockCheckInAsset(...args),
}));

import { CheckinoutWorkflow } from "@/app/(dashboard)/checkinout/_components/checkinout-workflow";

const USERS = [
  { id: "u_001", name: "Sara Patel", email: "sara@example.com", department: "Engineering" },
  { id: "u_002", name: "Marco Reyes", email: "marco@example.com", department: "Design" },
];

const AVAILABLE_MACBOOK = {
  id: "a_001",
  tag: "IT-0001",
  serial: "SN-ABCD1234",
  name: 'MacBook Pro 14"',
  category: "LAPTOP",
  status: "AVAILABLE",
};

const ASSIGNED_DELL = {
  id: "a_002",
  tag: "IT-0002",
  serial: "SN-EFGH5678",
  name: "Dell XPS 13",
  category: "LAPTOP",
  status: "ASSIGNED",
  currentAssigneeId: "u_001",
};

describe("CheckinoutWorkflow", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
    mockLookupAsset.mockReset();
    mockCheckOutAsset.mockReset();
    mockCheckInAsset.mockReset();
    mockGetActiveUsers.mockReset();
    mockGetActiveUsers.mockResolvedValue({ success: true, users: USERS });
  });

  it("renders the empty prompt on first mount", () => {
    render(<CheckinoutWorkflow />);
    expect(
      screen.getByTestId("checkinout-empty-prompt"),
    ).toHaveTextContent(/enter an asset tag or serial number/i);
    expect(screen.queryByTestId("asset-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("asset-not-found")).not.toBeInTheDocument();
  });

  it("walks the full lookup → check-out → check-in flow end-to-end", async () => {
    // First lookup: AVAILABLE asset
    mockLookupAsset.mockResolvedValueOnce({
      success: true,
      asset: AVAILABLE_MACBOOK,
      assignee: null,
      history: [],
    });

    // After checkout, refresh lookup returns ASSIGNED with history
    const checkoutEvent = {
      id: "e_new_1",
      assetId: "a_001",
      type: "CHECK_OUT",
      userId: "u_002",
      timestamp: new Date().toISOString(),
    };
    mockCheckOutAsset.mockResolvedValueOnce({ success: true });
    mockLookupAsset.mockResolvedValueOnce({
      success: true,
      asset: { ...AVAILABLE_MACBOOK, status: "ASSIGNED", currentAssigneeId: "u_002" },
      assignee: USERS[1],
      history: [checkoutEvent],
    });

    // After checkin, refresh lookup returns AVAILABLE with history
    const checkinEvent = {
      id: "e_new_2",
      assetId: "a_001",
      type: "CHECK_IN",
      userId: "u_002",
      timestamp: new Date().toISOString(),
    };
    mockCheckInAsset.mockResolvedValueOnce({ success: true });
    mockLookupAsset.mockResolvedValueOnce({
      success: true,
      asset: AVAILABLE_MACBOOK,
      assignee: null,
      history: [checkinEvent, checkoutEvent],
    });

    render(<CheckinoutWorkflow />);

    // Step 1: look up an AVAILABLE asset (IT-0001 / MacBook Pro)
    fireEvent.change(
      screen.getByLabelText(/asset tag or serial number/i),
      { target: { value: "IT-0001" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /look up/i }));

    await waitFor(() => {
      expect(screen.getByTestId("asset-card")).toBeInTheDocument();
    });
    expect(screen.getByTestId("asset-card")).toHaveAttribute(
      "data-status",
      "AVAILABLE",
    );
    expect(
      screen.getByTestId("asset-card-checkout-button"),
    ).toBeInTheDocument();

    // Step 2: open the check-out modal
    fireEvent.click(screen.getByTestId("asset-card-checkout-button"));
    await waitFor(() => {
      expect(screen.getByTestId("checkout-modal")).toBeInTheDocument();
    });

    // Step 3: select a user and submit
    fireEvent.change(screen.getByTestId("checkout-user-select"), {
      target: { value: "u_002" }, // Marco Reyes
    });
    fireEvent.click(screen.getByTestId("checkout-submit-button"));

    // Card flips to ASSIGNED, history has a fresh check-out row
    await waitFor(() => {
      expect(screen.getByTestId("asset-card")).toHaveAttribute(
        "data-status",
        "ASSIGNED",
      );
    });
    expect(toastSuccess).toHaveBeenCalledWith(
      "Asset checked out successfully",
    );
    expect(
      screen.getByText(/Assigned to: Marco Reyes \(Design\)/),
    ).toBeInTheDocument();

    const firstHistoryRow = screen.getAllByTestId("history-item")[0];
    expect(firstHistoryRow).toHaveAttribute("data-event-type", "CHECK_OUT");
    expect(
      within(firstHistoryRow).getByText(/Checked out to Marco Reyes/),
    ).toBeInTheDocument();

    // Step 4: check it back in
    fireEvent.click(screen.getByTestId("asset-card-checkin-button"));
    await waitFor(() => {
      expect(screen.getByTestId("checkin-modal")).toBeInTheDocument();
    });
    expect(screen.getByText(/returning from marco reyes/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("checkin-submit-button"));

    await waitFor(() => {
      expect(screen.getByTestId("asset-card")).toHaveAttribute(
        "data-status",
        "AVAILABLE",
      );
    });
    expect(toastSuccess).toHaveBeenCalledWith(
      "Asset checked in successfully",
    );

    // History now has the check-in at the top and check-out directly below
    const rowsAfterCheckin = screen.getAllByTestId("history-item");
    expect(rowsAfterCheckin[0]).toHaveAttribute("data-event-type", "CHECK_IN");
    expect(
      within(rowsAfterCheckin[0]).getByText(/Checked in from Marco Reyes/),
    ).toBeInTheDocument();
    expect(rowsAfterCheckin[1]).toHaveAttribute("data-event-type", "CHECK_OUT");
  });

  it("shows the not-found panel and clears it on demand", async () => {
    mockLookupAsset.mockResolvedValueOnce({
      success: false,
      error: "Asset not found",
    });

    render(<CheckinoutWorkflow />);

    fireEvent.change(
      screen.getByLabelText(/asset tag or serial number/i),
      { target: { value: "NOT-A-REAL-TAG" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /look up/i }));

    await waitFor(() => {
      expect(screen.getByTestId("asset-not-found")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/No asset matches .*NOT-A-REAL-TAG/),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("asset-card")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("asset-not-found-clear"));

    await waitFor(() => {
      expect(screen.queryByTestId("asset-not-found")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("checkinout-empty-prompt")).toBeInTheDocument();
  });

  it("looks up an already-ASSIGNED asset and surfaces the Check in action", async () => {
    mockLookupAsset.mockResolvedValueOnce({
      success: true,
      asset: ASSIGNED_DELL,
      assignee: USERS[0], // Sara Patel
      history: [],
    });

    render(<CheckinoutWorkflow />);

    fireEvent.change(
      screen.getByLabelText(/asset tag or serial number/i),
      { target: { value: "SN-EFGH5678" } }, // Dell XPS 13 serial, ASSIGNED to Sara
    );
    fireEvent.click(screen.getByRole("button", { name: /look up/i }));

    await waitFor(() => {
      expect(screen.getByTestId("asset-card")).toHaveAttribute(
        "data-status",
        "ASSIGNED",
      );
    });
    expect(
      screen.getByText(/Assigned to: Sara Patel \(Engineering\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("asset-card-checkin-button"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("asset-card-checkout-button"),
    ).not.toBeInTheDocument();
  });
});
