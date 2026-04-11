import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarrantyBadge } from "@/components/warranty-badge";
import type { WarrantyStatus } from "@/lib/inventory/warranty";

const CASES: Array<{ status: WarrantyStatus; label: string }> = [
  { status: "UNDER_WARRANTY", label: "Under warranty" },
  { status: "EXPIRING_SOON", label: "Expiring soon" },
  { status: "EXPIRED", label: "Expired" },
  { status: "NO_WARRANTY", label: "No warranty" },
];

describe("WarrantyBadge", () => {
  for (const { status, label } of CASES) {
    it(`renders label "${label}" for ${status}`, () => {
      render(<WarrantyBadge status={status} />);
      expect(screen.getByTestId("warranty-badge")).toHaveTextContent(label);
    });

    it(`sets data-warranty-status="${status}"`, () => {
      render(<WarrantyBadge status={status} />);
      expect(screen.getByTestId("warranty-badge")).toHaveAttribute(
        "data-warranty-status",
        status,
      );
    });
  }

  it("merges a custom className onto the root element", () => {
    render(<WarrantyBadge status="UNDER_WARRANTY" className="custom-xyz" />);
    expect(screen.getByTestId("warranty-badge").className).toContain(
      "custom-xyz",
    );
  });
});
