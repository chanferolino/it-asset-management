import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AssetCard } from "@/app/(dashboard)/checkinout/_components/asset-card";
import type { Asset, User } from "@/lib/checkinout/types";

const BASE_ASSET: Asset = {
  id: "a_001",
  tag: "IT-0001",
  serial: "SN-ABCD1234",
  name: 'MacBook Pro 14"',
  category: "LAPTOP",
  status: "AVAILABLE",
};

const USER: User = {
  id: "u_001",
  name: "Sara Patel",
  email: "sara.patel@example.com",
  department: "Engineering",
};

function renderCard(overrides: Partial<Asset> = {}, assignee: User | null = null) {
  const onCheckout = vi.fn();
  const onCheckin = vi.fn();
  render(
    <AssetCard
      asset={{ ...BASE_ASSET, ...overrides }}
      assignee={assignee}
      onCheckoutClick={onCheckout}
      onCheckinClick={onCheckin}
    />,
  );
  return { onCheckout, onCheckin };
}

describe("AssetCard", () => {
  it("renders name, tag, serial, and category", () => {
    renderCard();
    expect(screen.getByText(/MacBook Pro 14/)).toBeInTheDocument();
    expect(screen.getByText(/IT-0001/)).toBeInTheDocument();
    expect(screen.getByText(/SN-ABCD1234/)).toBeInTheDocument();
    expect(screen.getByText(/Laptop/)).toBeInTheDocument();
  });

  it("renders the Check out button for an AVAILABLE asset and wires the callback", () => {
    const { onCheckout, onCheckin } = renderCard({ status: "AVAILABLE" });
    const button = screen.getByTestId("asset-card-checkout-button");
    fireEvent.click(button);
    expect(onCheckout).toHaveBeenCalledTimes(1);
    expect(onCheckin).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId("asset-card-checkin-button"),
    ).not.toBeInTheDocument();
  });

  it("renders the Check in button and the assignee line for an ASSIGNED asset", () => {
    const { onCheckout, onCheckin } = renderCard(
      { status: "ASSIGNED", currentAssigneeId: "u_001" },
      USER,
    );
    expect(
      screen.getByText(/Assigned to: Sara Patel \(Engineering\)/),
    ).toBeInTheDocument();
    const button = screen.getByTestId("asset-card-checkin-button");
    fireEvent.click(button);
    expect(onCheckin).toHaveBeenCalledTimes(1);
    expect(onCheckout).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId("asset-card-checkout-button"),
    ).not.toBeInTheDocument();
  });

  it("renders a fallback assignee line when ASSIGNED and assignee is null", () => {
    renderCard({ status: "ASSIGNED", currentAssigneeId: "u_001" }, null);
    expect(screen.getByText(/Assigned \(user unknown\)/)).toBeInTheDocument();
    expect(
      screen.getByTestId("asset-card-checkin-button"),
    ).toBeInTheDocument();
  });

  it("renders the disabled note for a RETIRED asset and no action buttons", () => {
    renderCard({ status: "RETIRED" });
    expect(
      screen.getByTestId("asset-card-disabled-note"),
    ).toHaveTextContent(/retired/i);
    expect(
      screen.queryByTestId("asset-card-checkout-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("asset-card-checkin-button"),
    ).not.toBeInTheDocument();
  });

  it("renders the disabled note for an IN_REPAIR asset and no action buttons", () => {
    renderCard({ status: "IN_REPAIR" });
    expect(
      screen.getByTestId("asset-card-disabled-note"),
    ).toHaveTextContent(/in repair/i);
    expect(
      screen.queryByTestId("asset-card-checkout-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("asset-card-checkin-button"),
    ).not.toBeInTheDocument();
  });

  it("applies a data-status attribute that matches the asset status", () => {
    renderCard({ status: "ASSIGNED", currentAssigneeId: "u_001" }, USER);
    expect(screen.getByTestId("asset-card")).toHaveAttribute(
      "data-status",
      "ASSIGNED",
    );
  });
});
