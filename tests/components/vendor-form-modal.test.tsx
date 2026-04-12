import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VendorFormModal } from "@/app/(dashboard)/vendors/_components/vendor-form-modal";
import type { Vendor } from "@/lib/vendors/types";

const EXISTING: Vendor = {
  id: "v_edit",
  name: "Existing Vendor",
  contactEmail: "existing@example.com",
  contactPhone: "+1 555 0100",
  website: "https://existing.example",
  notes: "Pre-existing notes.",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("VendorFormModal", () => {
  it("renders in create mode with an empty form", () => {
    render(
      <VendorFormModal open onOpenChange={vi.fn()} onSubmit={vi.fn()} />,
    );
    expect(
      screen.getByRole("heading", { name: /add vendor/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("vendor-form-name")).toHaveValue("");
    expect(screen.getByTestId("vendor-form-email")).toHaveValue("");
    expect(screen.getByTestId("vendor-form-submit")).toHaveTextContent(
      /create vendor/i,
    );
  });

  it("pre-fills fields in edit mode", () => {
    render(
      <VendorFormModal
        open
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        vendor={EXISTING}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /edit vendor/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("vendor-form-name")).toHaveValue(
      "Existing Vendor",
    );
    expect(screen.getByTestId("vendor-form-email")).toHaveValue(
      "existing@example.com",
    );
    expect(screen.getByTestId("vendor-form-phone")).toHaveValue("+1 555 0100");
    expect(screen.getByTestId("vendor-form-website")).toHaveValue(
      "https://existing.example",
    );
    expect(screen.getByTestId("vendor-form-notes")).toHaveValue(
      "Pre-existing notes.",
    );
    expect(screen.getByTestId("vendor-form-submit")).toHaveTextContent(
      /save changes/i,
    );
  });

  it("submits minimal payload with optional fields as undefined", async () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <VendorFormModal
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByTestId("vendor-form-name"), {
      target: { value: "  New Vendor  " },
    });
    fireEvent.change(screen.getByTestId("vendor-form-email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.submit(screen.getByTestId("vendor-form"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      name: "New Vendor",
      contactEmail: "new@example.com",
      contactPhone: undefined,
      website: undefined,
      notes: undefined,
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("submits full payload when every field is filled", async () => {
    const onSubmit = vi.fn();
    render(
      <VendorFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByTestId("vendor-form-name"), {
      target: { value: "Full Vendor" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-email"), {
      target: { value: "full@example.com" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-phone"), {
      target: { value: "+1 555 0199" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-website"), {
      target: { value: "https://full.example" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-notes"), {
      target: { value: "Primary supplier" },
    });
    fireEvent.submit(screen.getByTestId("vendor-form"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Full Vendor",
      contactEmail: "full@example.com",
      contactPhone: "+1 555 0199",
      website: "https://full.example",
      notes: "Primary supplier",
    });
  });

  it("shows a validation error when the name is empty", async () => {
    const onSubmit = vi.fn();
    render(
      <VendorFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByTestId("vendor-form-email"), {
      target: { value: "only@example.com" },
    });
    fireEvent.submit(screen.getByTestId("vendor-form"));

    expect(
      await screen.findByText(/enter a vendor name/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error when the email is empty", async () => {
    const onSubmit = vi.fn();
    render(
      <VendorFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByTestId("vendor-form-name"), {
      target: { value: "Nameless" },
    });
    fireEvent.submit(screen.getByTestId("vendor-form"));

    expect(
      await screen.findByText(/enter a contact email/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error when the email is malformed", async () => {
    const onSubmit = vi.fn();
    render(
      <VendorFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByTestId("vendor-form-name"), {
      target: { value: "Bad Email" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.submit(screen.getByTestId("vendor-form"));

    expect(
      await screen.findByText(/enter a valid email/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error when the website is not a valid URL", async () => {
    const onSubmit = vi.fn();
    render(
      <VendorFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByTestId("vendor-form-name"), {
      target: { value: "Bad URL" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-email"), {
      target: { value: "ok@example.com" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-website"), {
      target: { value: "not a url" },
    });
    fireEvent.submit(screen.getByTestId("vendor-form"));

    expect(
      await screen.findByText(/enter a valid url/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("accepts an empty website without showing a URL error", async () => {
    const onSubmit = vi.fn();
    render(
      <VendorFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByTestId("vendor-form-name"), {
      target: { value: "Clean" },
    });
    fireEvent.change(screen.getByTestId("vendor-form-email"), {
      target: { value: "clean@example.com" },
    });
    fireEvent.submit(screen.getByTestId("vendor-form"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ website: undefined }),
    );
  });

  it("calls onOpenChange(false) and does not submit when Cancel is clicked", () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <VendorFormModal
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId("vendor-form-cancel"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
