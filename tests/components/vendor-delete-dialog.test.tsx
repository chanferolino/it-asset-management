import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VendorDeleteDialog } from "@/app/(dashboard)/vendors/_components/vendor-delete-dialog";

describe("VendorDeleteDialog", () => {
  it("renders the title and description containing the vendor name", () => {
    render(
      <VendorDeleteDialog
        open
        onOpenChange={vi.fn()}
        vendorName="Acme Supply Co."
        onConfirm={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /delete vendor\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("vendor-delete-dialog-description"),
    ).toHaveTextContent(/delete acme supply co\.\? this cannot be undone\./i);
  });

  it("calls onConfirm and onOpenChange(false) when Delete is clicked", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <VendorDeleteDialog
        open
        onOpenChange={onOpenChange}
        vendorName="Acme"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByTestId("vendor-delete-confirm"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange(false) and does not call onConfirm when Cancel is clicked", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <VendorDeleteDialog
        open
        onOpenChange={onOpenChange}
        vendorName="Acme"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByTestId("vendor-delete-cancel"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
