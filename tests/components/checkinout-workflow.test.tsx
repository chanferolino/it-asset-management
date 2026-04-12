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

import { CheckinoutWorkflow } from "@/app/(dashboard)/checkinout/_components/checkinout-workflow";

describe("CheckinoutWorkflow", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
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
      "Checked out — recorded locally (UI only)",
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
      "Checked in — recorded locally (UI only)",
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
