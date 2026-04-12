import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CheckoutModal } from "@/app/(dashboard)/checkinout/_components/checkout-modal";
import type { Asset, User } from "@/lib/checkinout/types";

const ASSET: Asset = {
  id: "a_001",
  tag: "IT-0001",
  serial: "SN-ABCD1234",
  name: 'MacBook Pro 14"',
  category: "LAPTOP",
  status: "AVAILABLE",
};

const USERS: User[] = [
  {
    id: "u_001",
    name: "Sara Patel",
    email: "sara.patel@example.com",
    department: "Engineering",
  },
  {
    id: "u_002",
    name: "Marco Reyes",
    email: "marco.reyes@example.com",
    department: "Design",
  },
];

describe("CheckoutModal", () => {
  it("renders the title with the asset name and the user select", () => {
    render(
      <CheckoutModal
        open
        onOpenChange={vi.fn()}
        asset={ASSET}
        users={USERS}
        onSubmit={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /check out macbook pro 14/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("checkout-user-select")).toBeInTheDocument();
    expect(screen.getByText(/Sara Patel.*Engineering/)).toBeInTheDocument();
  });

  it("calls onSubmit with the selected userId and undefined notes when notes are empty", async () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CheckoutModal
        open
        onOpenChange={onOpenChange}
        asset={ASSET}
        users={USERS}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByTestId("checkout-user-select"), {
      target: { value: "u_002" },
    });
    fireEvent.click(screen.getByTestId("checkout-submit-button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      userId: "u_002",
      notes: undefined,
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("passes notes through when provided", async () => {
    const onSubmit = vi.fn();
    render(
      <CheckoutModal
        open
        onOpenChange={vi.fn()}
        asset={ASSET}
        users={USERS}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByTestId("checkout-user-select"), {
      target: { value: "u_001" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/optional notes/i),
      { target: { value: "Loaner for remote work" } },
    );
    fireEvent.click(screen.getByTestId("checkout-submit-button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      userId: "u_001",
      notes: "Loaner for remote work",
    });
  });

  it("does not submit and shows a validation error when no user is selected", async () => {
    const onSubmit = vi.fn();
    render(
      <CheckoutModal
        open
        onOpenChange={vi.fn()}
        asset={ASSET}
        users={USERS}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("checkout-submit-button"));

    expect(await screen.findByText(/select a user/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onOpenChange(false) when Cancel is clicked and does not submit", () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CheckoutModal
        open
        onOpenChange={onOpenChange}
        asset={ASSET}
        users={USERS}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("checkout-cancel-button"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
