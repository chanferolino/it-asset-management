import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

vi.mock("@/lib/actions/vendors", () => ({
  createVendor: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}));

import { VendorsListContainer } from "@/app/(dashboard)/vendors/_components/vendors-list-container";
import type { VendorWithCount } from "@/lib/actions/vendors";

const SEED: VendorWithCount[] = [
  {
    id: "v_a",
    name: "Alpha Supply",
    contactEmail: "a@alpha.example",
    createdAt: "2026-01-01T00:00:00.000Z",
    assetCount: 3,
  },
  {
    id: "v_b",
    name: "Bravo Logistics",
    contactEmail: "b@bravo.example",
    contactPhone: "+1 555 0199",
    createdAt: "2026-01-02T00:00:00.000Z",
    assetCount: 1,
  },
];

describe("VendorsListContainer", () => {
  it("renders a card for each seeded vendor and shows the count", () => {
    render(<VendorsListContainer initialVendors={SEED} />);
    const cards = screen.getAllByTestId("vendor-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("2 vendors")).toBeInTheDocument();
  });

  it("renders the empty state when there are no vendors", () => {
    render(<VendorsListContainer initialVendors={[]} />);
    expect(screen.getByTestId("vendors-empty-state")).toBeInTheDocument();
    expect(screen.getByText(/no vendors yet/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId("vendor-card")).toHaveLength(0);
  });

  it("opens the form modal when Add vendor is clicked", () => {
    render(<VendorsListContainer initialVendors={SEED} />);
    const container = screen.getByTestId("vendors-list-container");
    expect(container).toHaveAttribute("data-create-open", "false");
    fireEvent.click(screen.getByTestId("vendors-add-button"));
    expect(container).toHaveAttribute("data-create-open", "true");
    expect(screen.getByTestId("vendor-form-modal")).toBeInTheDocument();
  });

  it("opens the form modal from the empty state button", () => {
    render(<VendorsListContainer initialVendors={[]} />);
    fireEvent.click(screen.getByTestId("vendors-empty-add-button"));
    expect(
      screen.getByTestId("vendors-list-container"),
    ).toHaveAttribute("data-create-open", "true");
  });

  it("calls createVendor and shows success toast on form submit", async () => {
    const { createVendor } = await import("@/lib/actions/vendors");
    render(<VendorsListContainer initialVendors={SEED} />);
    fireEvent.click(screen.getByTestId("vendors-add-button"));

    const modal = screen.getByTestId("vendor-form-modal");
    fireEvent.change(within(modal).getByTestId("vendor-form-name"), {
      target: { value: "Charlie Components" },
    });
    fireEvent.change(within(modal).getByTestId("vendor-form-email"), {
      target: { value: "hello@charlie.example" },
    });
    fireEvent.submit(within(modal).getByTestId("vendor-form"));

    await waitFor(() => {
      expect(createVendor).toHaveBeenCalledTimes(1);
    });
    expect(toastSuccess).toHaveBeenCalledWith("Vendor created");
  });
});
