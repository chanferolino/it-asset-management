import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { VendorDetailContainer } from "@/app/(dashboard)/vendors/_components/vendor-detail-container";
import type { Asset } from "@/lib/inventory/types";
import type { Vendor } from "@/lib/vendors/types";

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}));

const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

const VENDOR: Vendor = {
  id: "v_test",
  name: "Acme Supply Co.",
  contactEmail: "sales@acme.example",
  contactPhone: "+1 (415) 555-0100",
  website: "https://acme.example",
  notes: "Net-30 terms.",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const ASSETS: Asset[] = [
  {
    id: "a_001",
    tag: "IT-0001",
    serial: "SN-1",
    name: 'MacBook Pro 14"',
    category: "LAPTOP",
    status: "AVAILABLE",
    purchaseDate: "2025-01-01",
    purchaseCost: 200000,
    warrantyExpiresAt: "2027-01-01",
    vendorId: "v_test",
  },
  {
    id: "a_002",
    tag: "IT-0002",
    serial: "SN-2",
    name: "Dell UltraSharp 27",
    category: "MONITOR",
    status: "AVAILABLE",
    purchaseDate: "2025-02-01",
    purchaseCost: 50000,
    warrantyExpiresAt: "2027-02-01",
    vendorId: "v_test",
  },
];

function renderContainer(
  overrides: Partial<React.ComponentProps<typeof VendorDetailContainer>> = {},
) {
  toastSuccess.mockClear();
  routerPush.mockClear();
  return render(
    <VendorDetailContainer
      initialVendor={VENDOR}
      initialAssets={ASSETS}
      {...overrides}
    />,
  );
}

describe("VendorDetailContainer", () => {
  it("renders the vendor email, phone, website, and notes", () => {
    renderContainer();
    expect(screen.getByTestId("vendor-detail-email")).toHaveTextContent(
      "sales@acme.example",
    );
    expect(screen.getByTestId("vendor-detail-phone")).toHaveTextContent(
      "+1 (415) 555-0100",
    );
    expect(screen.getByTestId("vendor-detail-website")).toHaveTextContent(
      "https://acme.example",
    );
    expect(screen.getByTestId("vendor-detail-notes")).toHaveTextContent(
      /net-30 terms/i,
    );
  });

  it("renders the linked assets table with one row per asset", () => {
    renderContainer();
    const rows = screen.getAllByTestId("vendor-assets-row");
    expect(rows).toHaveLength(2);
    const firstLink = within(rows[0]).getByRole("link", { name: "IT-0001" });
    expect(firstLink).toHaveAttribute("href", "/inventory/a_001");
  });

  it("renders the empty state when initialAssets is empty", () => {
    renderContainer({ initialAssets: [] });
    expect(screen.getByTestId("vendor-assets-empty")).toHaveTextContent(
      /no assets supplied/i,
    );
    expect(screen.queryAllByTestId("vendor-assets-row")).toHaveLength(0);
  });

  it("opens the edit modal pre-filled with the vendor's values", () => {
    renderContainer();
    fireEvent.click(screen.getByTestId("vendor-detail-edit-button"));
    const modal = screen.getByTestId("vendor-form-modal");
    expect(
      within(modal).getByRole("heading", { name: /edit vendor/i }),
    ).toBeInTheDocument();
    expect(within(modal).getByTestId("vendor-form-name")).toHaveValue(
      "Acme Supply Co.",
    );
    expect(within(modal).getByTestId("vendor-form-email")).toHaveValue(
      "sales@acme.example",
    );
  });

  it("updates the displayed vendor when the edit form is submitted", async () => {
    renderContainer();
    fireEvent.click(screen.getByTestId("vendor-detail-edit-button"));
    const modal = screen.getByTestId("vendor-form-modal");

    fireEvent.change(within(modal).getByTestId("vendor-form-name"), {
      target: { value: "Acme Supply Renamed" },
    });
    fireEvent.submit(within(modal).getByTestId("vendor-form"));

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith(
        "Vendor updated — recorded locally (UI only)",
      );
    });
    // The updated name now appears in the edit button context via the
    // delete dialog description (re-opening it will reflect new name).
    fireEvent.click(screen.getByTestId("vendor-detail-delete-button"));
    expect(
      screen.getByTestId("vendor-delete-dialog-description"),
    ).toHaveTextContent(/acme supply renamed/i);
  });

  it("opens the delete dialog with the vendor name when Delete is clicked", () => {
    renderContainer();
    fireEvent.click(screen.getByTestId("vendor-detail-delete-button"));
    expect(
      screen.getByTestId("vendor-delete-dialog-description"),
    ).toHaveTextContent(/acme supply co\./i);
  });

  it("fires toast and navigates to /vendors when delete is confirmed", () => {
    renderContainer();
    fireEvent.click(screen.getByTestId("vendor-detail-delete-button"));
    fireEvent.click(screen.getByTestId("vendor-delete-confirm"));

    expect(toastSuccess).toHaveBeenCalledWith(
      "Vendor deleted — recorded locally (UI only)",
    );
    expect(routerPush).toHaveBeenCalledWith("/vendors");
  });
});
