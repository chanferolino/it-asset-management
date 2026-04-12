import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { InventoryWarrantyView } from "@/app/(dashboard)/inventory/_components/inventory-warranty-view";

const TODAY = new Date("2026-04-11T00:00:00.000Z");

// Expected counts against MOCK_ASSETS at TODAY anchor:
//   EXPIRED: 2 (inv_004, inv_007)
//   EXPIRING_SOON: 3 (inv_002, inv_006, inv_010)
//   UNDER_WARRANTY: 5
//   NO_WARRANTY: 2
const EXPECTED_TOTAL = 12;

describe("InventoryWarrantyView", () => {
  it("renders the alert banner with the expected seed counts", () => {
    render(<InventoryWarrantyView todayOverride={TODAY} />);
    expect(screen.getByTestId("warranty-alert-copy")).toHaveTextContent(
      "2 warranties expired, 3 expiring within 30 days",
    );
  });

  it("renders every asset in the table by default", () => {
    render(<InventoryWarrantyView todayOverride={TODAY} />);
    expect(screen.getAllByTestId("warranty-table-row")).toHaveLength(
      EXPECTED_TOTAL,
    );
    expect(screen.getByTestId("warranty-filter-row")).toHaveAttribute(
      "data-active-filter",
      "ALL",
    );
  });

  it("filters the table to expired assets when 'View expired' is clicked", () => {
    render(<InventoryWarrantyView todayOverride={TODAY} />);
    fireEvent.click(screen.getByTestId("warranty-alert-view-expired"));
    const rows = screen.getAllByTestId("warranty-table-row");
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toHaveAttribute("data-warranty-status", "EXPIRED");
    }
    expect(screen.getByTestId("warranty-filter-row")).toHaveAttribute(
      "data-active-filter",
      "EXPIRED",
    );
  });

  it("filters the table to expiring-soon assets via the filter button", () => {
    render(<InventoryWarrantyView todayOverride={TODAY} />);
    fireEvent.click(screen.getByTestId("warranty-filter-expiring_soon"));
    const rows = screen.getAllByTestId("warranty-table-row");
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row).toHaveAttribute("data-warranty-status", "EXPIRING_SOON");
    }
  });

  it("resets to all assets when the All filter is clicked", () => {
    render(<InventoryWarrantyView todayOverride={TODAY} />);
    fireEvent.click(screen.getByTestId("warranty-filter-expired"));
    expect(screen.getAllByTestId("warranty-table-row")).toHaveLength(2);
    fireEvent.click(screen.getByTestId("warranty-filter-all"));
    expect(screen.getAllByTestId("warranty-table-row")).toHaveLength(
      EXPECTED_TOTAL,
    );
  });

  it("removes the banner from the DOM when dismissed", () => {
    render(<InventoryWarrantyView todayOverride={TODAY} />);
    expect(screen.getByTestId("warranty-alert-banner")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("warranty-alert-dismiss"));
    expect(
      screen.queryByTestId("warranty-alert-banner"),
    ).not.toBeInTheDocument();
  });

  it("renders a Manage vendors link pointing to /vendors", () => {
    render(<InventoryWarrantyView todayOverride={TODAY} />);
    expect(
      screen.getByTestId("inventory-manage-vendors-link"),
    ).toHaveAttribute("href", "/vendors");
  });
});
