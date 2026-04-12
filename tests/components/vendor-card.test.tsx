import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VendorCard } from "@/app/(dashboard)/vendors/_components/vendor-card";
import type { Vendor } from "@/lib/vendors/types";

const FULL_VENDOR: Vendor = {
  id: "v_001",
  name: "Acme Supply Co.",
  contactEmail: "sales@acme.example",
  contactPhone: "+1 (415) 555-0100",
  website: "https://acme.example",
  notes: "Net-30 terms. Primary laptop supplier.",
  createdAt: "2026-01-10T09:00:00.000Z",
};

const MINIMAL_VENDOR: Vendor = {
  id: "v_002",
  name: "BareMinimum Ltd.",
  contactEmail: "hello@bare.example",
  createdAt: "2026-02-14T09:00:00.000Z",
};

describe("VendorCard", () => {
  it("renders the vendor name, email, phone, website, and notes", () => {
    render(<VendorCard vendor={FULL_VENDOR} assetCount={3} />);
    expect(
      screen.getByRole("heading", { name: /acme supply co/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("sales@acme.example")).toBeInTheDocument();
    expect(screen.getByText("+1 (415) 555-0100")).toBeInTheDocument();
    expect(screen.getByText("https://acme.example")).toBeInTheDocument();
    expect(screen.getByText(/net-30 terms/i)).toBeInTheDocument();
  });

  it("omits optional fields when absent", () => {
    render(<VendorCard vendor={MINIMAL_VENDOR} assetCount={0} />);
    expect(screen.getByText("hello@bare.example")).toBeInTheDocument();
    expect(screen.queryByText(/net-30/i)).not.toBeInTheDocument();
    // phone and website rows rely on text presence
    expect(screen.queryByText(/https?:\/\//)).not.toBeInTheDocument();
  });

  it("shows singular asset label for count of 1", () => {
    render(<VendorCard vendor={FULL_VENDOR} assetCount={1} />);
    expect(screen.getByTestId("vendor-card-asset-count")).toHaveTextContent(
      "1 asset",
    );
  });

  it("shows plural asset label for count != 1", () => {
    render(<VendorCard vendor={FULL_VENDOR} assetCount={5} />);
    expect(screen.getByTestId("vendor-card-asset-count")).toHaveTextContent(
      "5 assets",
    );
  });

  it("exposes the vendor id via data attribute", () => {
    render(<VendorCard vendor={FULL_VENDOR} assetCount={2} />);
    expect(screen.getByTestId("vendor-card")).toHaveAttribute(
      "data-vendor-id",
      "v_001",
    );
  });

  it("sets mailto and tel hrefs correctly", () => {
    render(<VendorCard vendor={FULL_VENDOR} assetCount={0} />);
    expect(
      screen.getByRole("link", { name: "sales@acme.example" }),
    ).toHaveAttribute("href", "mailto:sales@acme.example");
    expect(
      screen.getByRole("link", { name: "+1 (415) 555-0100" }),
    ).toHaveAttribute("href", "tel:+1(415)555-0100");
  });
});
