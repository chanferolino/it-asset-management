import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  WarrantyTable,
  type WarrantyTableRow,
} from "@/app/(dashboard)/inventory/_components/warranty-table";
import type { Asset } from "@/lib/inventory/types";
import { MOCK_VENDORS } from "@/lib/vendors/mock-data";

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "inv_001",
    tag: "IT-0001",
    serial: "SN-1",
    name: 'MacBook Pro 14"',
    category: "LAPTOP",
    status: "ASSIGNED",
    purchaseDate: "2025-09-04",
    purchaseCost: 229900,
    warrantyExpiresAt: "2028-09-04",
    vendorId: "v_001",
    ...overrides,
  };
}

const ROWS: WarrantyTableRow[] = [
  {
    asset: makeAsset(),
    status: "UNDER_WARRANTY",
  },
  {
    asset: makeAsset({
      id: "inv_011",
      tag: "IT-0011",
      name: "Anker USB-C Hub",
      category: "ACCESSORY",
      warrantyExpiresAt: null,
      vendorId: null,
    }),
    status: "NO_WARRANTY",
  },
];

describe("WarrantyTable", () => {
  it("renders one row per asset with the expected cells", () => {
    render(<WarrantyTable assets={ROWS} vendors={MOCK_VENDORS} />);
    const rows = screen.getAllByTestId("warranty-table-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute("data-warranty-status", "UNDER_WARRANTY");
    expect(rows[1]).toHaveAttribute("data-warranty-status", "NO_WARRANTY");
  });

  it("renders the tag cell as a link to the asset detail page", () => {
    render(<WarrantyTable assets={ROWS} vendors={MOCK_VENDORS} />);
    const firstRow = screen.getAllByTestId("warranty-table-row")[0];
    const tagLink = within(firstRow).getByRole("link", { name: "IT-0001" });
    expect(tagLink).toHaveAttribute("href", "/inventory/inv_001");
  });

  it("renders the vendor cell as a link to the vendor detail when vendor exists", () => {
    render(<WarrantyTable assets={ROWS} vendors={MOCK_VENDORS} />);
    const firstRow = screen.getAllByTestId("warranty-table-row")[0];
    // MOCK_VENDORS has v_001 = Acme Supply Co.
    const vendorLink = within(firstRow).getByRole("link", {
      name: /acme supply co\./i,
    });
    expect(vendorLink).toHaveAttribute("href", "/vendors/v_001");
  });

  it("renders — for the vendor cell when vendorId is null", () => {
    render(<WarrantyTable assets={ROWS} vendors={MOCK_VENDORS} />);
    const secondRow = screen.getAllByTestId("warranty-table-row")[1];
    const cells = within(secondRow).getAllByRole("cell");
    expect(cells[cells.length - 1]).toHaveTextContent("—");
  });

  it("renders the empty state when given an empty list", () => {
    render(<WarrantyTable assets={[]} vendors={MOCK_VENDORS} />);
    expect(screen.getByTestId("warranty-table-empty")).toHaveTextContent(
      /no assets match the current filter/i,
    );
    expect(screen.queryAllByTestId("warranty-table-row")).toHaveLength(0);
  });
});
