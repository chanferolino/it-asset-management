import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { VendorsListContainer } from "@/app/(dashboard)/vendors/_components/vendors-list-container";
import type { Vendor } from "@/lib/vendors/types";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const SEED: Vendor[] = [
  {
    id: "v_a",
    name: "Alpha Supply",
    contactEmail: "a@alpha.example",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "v_b",
    name: "Bravo Logistics",
    contactEmail: "b@bravo.example",
    contactPhone: "+1 555 0199",
    createdAt: "2026-01-02T00:00:00.000Z",
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

  it("renders the UI-only notice", () => {
    render(<VendorsListContainer initialVendors={SEED} />);
    expect(
      screen.getByText(/ui-only preview — changes are not saved/i),
    ).toBeInTheDocument();
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

  it("prepends a newly created vendor and updates the count", async () => {
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

    const newCard = await screen.findByText("Charlie Components");
    expect(newCard).toBeInTheDocument();
    const allCards = screen.getAllByTestId("vendor-card");
    expect(allCards).toHaveLength(3);
    // Newly added vendor appears first (prepend behavior)
    expect(
      within(allCards[0]).getByRole("heading"),
    ).toHaveTextContent("Charlie Components");
    expect(screen.getByText("3 vendors")).toBeInTheDocument();
  });
});
