import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AssetDetailHeader } from "@/app/(dashboard)/inventory/_components/asset-detail-header";
import { WarrantyBlock } from "@/app/(dashboard)/inventory/_components/warranty-block";
import { VendorBlock } from "@/app/(dashboard)/inventory/_components/vendor-block";
import type { Asset } from "@/lib/inventory/types";
import { getWarrantyStatus } from "@/lib/inventory/warranty";
import type { Vendor } from "@/lib/vendors/types";

const TODAY = new Date("2026-04-11T00:00:00.000Z");

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "a_full",
    tag: "IT-0100",
    serial: "SN-FULL",
    name: "MacBook Pro 16",
    category: "LAPTOP",
    status: "ASSIGNED",
    purchaseDate: "2025-06-15",
    purchaseCost: 249900,
    warrantyExpiresAt: "2028-06-15",
    vendorId: "v_primary",
    ...overrides,
  };
}

const VENDOR: Vendor = {
  id: "v_primary",
  name: "Acme Supply Co.",
  contactEmail: "sales@acme.example",
  contactPhone: "+1 (415) 555-0100",
  website: "https://acme.example",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("AssetDetailHeader", () => {
  it("renders name, tag, serial, category, and status", () => {
    render(<AssetDetailHeader asset={makeAsset()} />);
    expect(
      screen.getByRole("heading", { name: "MacBook Pro 16" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tag: IT-0100/)).toBeInTheDocument();
    expect(screen.getByText(/Serial: SN-FULL/)).toBeInTheDocument();
    expect(screen.getByText(/Category: Laptop/)).toBeInTheDocument();
    expect(screen.getByTestId("asset-status-badge")).toHaveAttribute(
      "data-asset-status",
      "ASSIGNED",
    );
  });

  it("renders a back link to /inventory", () => {
    render(<AssetDetailHeader asset={makeAsset()} />);
    expect(
      screen.getByRole("link", { name: /back to inventory/i }),
    ).toHaveAttribute("href", "/inventory");
  });
});

describe("WarrantyBlock", () => {
  it("renders purchase date, cost, and expiration for a full asset", () => {
    const asset = makeAsset();
    const status = getWarrantyStatus(asset.warrantyExpiresAt, TODAY);
    render(<WarrantyBlock asset={asset} status={status} today={TODAY} />);
    expect(screen.getByTestId("warranty-block-purchase-date")).toHaveTextContent(
      "June 15, 2025",
    );
    expect(screen.getByTestId("warranty-block-purchase-cost")).toHaveTextContent(
      "$2,499.00",
    );
    expect(screen.getByTestId("warranty-block-expires")).toHaveTextContent(
      "June 15, 2028",
    );
    expect(screen.getByTestId("warranty-badge")).toHaveAttribute(
      "data-warranty-status",
      "UNDER_WARRANTY",
    );
  });

  it("shows — for null purchaseDate, purchaseCost, and warrantyExpiresAt", () => {
    const asset = makeAsset({
      purchaseDate: null,
      purchaseCost: null,
      warrantyExpiresAt: null,
    });
    render(
      <WarrantyBlock asset={asset} status="NO_WARRANTY" today={TODAY} />,
    );
    expect(screen.getByTestId("warranty-block-purchase-date")).toHaveTextContent(
      "—",
    );
    expect(screen.getByTestId("warranty-block-purchase-cost")).toHaveTextContent(
      "—",
    );
    expect(screen.getByTestId("warranty-block-expires")).toHaveTextContent("—");
    expect(screen.getByTestId("warranty-badge")).toHaveAttribute(
      "data-warranty-status",
      "NO_WARRANTY",
    );
  });

  it("shows EXPIRING_SOON badge and 'in 10 days' parenthetical when warranty is 10 days out", () => {
    const asset = makeAsset({ warrantyExpiresAt: "2026-04-21" });
    const status = getWarrantyStatus(asset.warrantyExpiresAt, TODAY);
    render(<WarrantyBlock asset={asset} status={status} today={TODAY} />);
    expect(screen.getByTestId("warranty-badge")).toHaveAttribute(
      "data-warranty-status",
      "EXPIRING_SOON",
    );
    expect(screen.getByTestId("warranty-block-relative")).toHaveTextContent(
      /in 10 days/i,
    );
  });

  it("shows EXPIRED badge and '5 days ago' parenthetical when warranty expired 5 days ago", () => {
    const asset = makeAsset({ warrantyExpiresAt: "2026-04-06" });
    const status = getWarrantyStatus(asset.warrantyExpiresAt, TODAY);
    render(<WarrantyBlock asset={asset} status={status} today={TODAY} />);
    expect(screen.getByTestId("warranty-badge")).toHaveAttribute(
      "data-warranty-status",
      "EXPIRED",
    );
    expect(screen.getByTestId("warranty-block-relative")).toHaveTextContent(
      /5 days ago/i,
    );
  });

  it("hides the relative parenthetical when warranty is far in the future", () => {
    const asset = makeAsset({ warrantyExpiresAt: "2030-01-01" });
    render(
      <WarrantyBlock asset={asset} status="UNDER_WARRANTY" today={TODAY} />,
    );
    expect(
      screen.queryByTestId("warranty-block-relative"),
    ).not.toBeInTheDocument();
  });
});

describe("VendorBlock", () => {
  it("renders the vendor name as a link to /vendors/[id] and the contact rows", () => {
    render(<VendorBlock vendor={VENDOR} />);
    const link = screen.getByTestId("vendor-block-link");
    expect(link).toHaveAttribute("href", "/vendors/v_primary");
    expect(link).toHaveTextContent("Acme Supply Co.");
    expect(screen.getByText("sales@acme.example")).toBeInTheDocument();
    expect(screen.getByText("+1 (415) 555-0100")).toBeInTheDocument();
    expect(screen.getByText("https://acme.example")).toBeInTheDocument();
  });

  it("renders 'Vendor no longer available' when vendor is null", () => {
    render(<VendorBlock vendor={null} />);
    expect(screen.getByTestId("vendor-block-empty")).toHaveTextContent(
      /vendor no longer available/i,
    );
    expect(screen.queryByTestId("vendor-block-link")).not.toBeInTheDocument();
  });
});
