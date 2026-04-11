import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CheckinModal } from "@/app/(dashboard)/checkinout/_components/checkin-modal";
import type { Asset, User } from "@/lib/checkinout/types";

const ASSET: Asset = {
  id: "a_002",
  tag: "IT-0002",
  serial: "SN-EFGH5678",
  name: "Dell XPS 13",
  category: "LAPTOP",
  status: "ASSIGNED",
  currentAssigneeId: "u_001",
};

const USER: User = {
  id: "u_001",
  name: "Sara Patel",
  email: "sara.patel@example.com",
  department: "Engineering",
};

describe("CheckinModal", () => {
  it("renders the asset name in the title and the 'Returning from' description", () => {
    render(
      <CheckinModal
        open
        onOpenChange={vi.fn()}
        asset={ASSET}
        currentAssignee={USER}
        onSubmit={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /check in dell xps 13/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/returning from sara patel/i)).toBeInTheDocument();
  });

  it("renders without the 'Returning from' line when currentAssignee is null", () => {
    render(
      <CheckinModal
        open
        onOpenChange={vi.fn()}
        asset={ASSET}
        currentAssignee={null}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.queryByText(/returning from/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("checkin-submit-button")).toBeInTheDocument();
  });

  it("calls onSubmit with undefined notes when notes are empty", async () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CheckinModal
        open
        onOpenChange={onOpenChange}
        asset={ASSET}
        currentAssignee={USER}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("checkin-submit-button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({ notes: undefined });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("passes notes through when provided", async () => {
    const onSubmit = vi.fn();
    render(
      <CheckinModal
        open
        onOpenChange={vi.fn()}
        asset={ASSET}
        currentAssignee={USER}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/optional notes/i), {
      target: { value: "Cracked screen" },
    });
    fireEvent.click(screen.getByTestId("checkin-submit-button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({ notes: "Cracked screen" });
  });

  it("calls onOpenChange(false) when Cancel is clicked and does not submit", () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CheckinModal
        open
        onOpenChange={onOpenChange}
        asset={ASSET}
        currentAssignee={USER}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("checkin-cancel-button"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
