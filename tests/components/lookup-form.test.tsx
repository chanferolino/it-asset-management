import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LookupForm } from "@/app/(dashboard)/checkinout/_components/lookup-form";

describe("LookupForm", () => {
  it("renders the labeled input and submit button", () => {
    render(<LookupForm onLookup={vi.fn()} />);
    expect(
      screen.getByLabelText(/asset tag or serial number/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e\.g\. it-0001/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /look up/i }),
    ).toBeInTheDocument();
  });

  it("auto-focuses the query input on mount", async () => {
    render(<LookupForm onLookup={vi.fn()} />);
    await waitFor(() => {
      expect(
        screen.getByLabelText(/asset tag or serial number/i),
      ).toHaveFocus();
    });
  });

  it("calls onLookup with the typed query on submit", async () => {
    const onLookup = vi.fn();
    render(<LookupForm onLookup={onLookup} />);

    const input = screen.getByLabelText(/asset tag or serial number/i);
    fireEvent.change(input, { target: { value: "IT-0042" } });
    fireEvent.click(screen.getByRole("button", { name: /look up/i }));

    await waitFor(() => {
      expect(onLookup).toHaveBeenCalledTimes(1);
    });
    expect(onLookup).toHaveBeenCalledWith("IT-0042");
  });

  it("does not call onLookup when submitting an empty input and shows a validation error", async () => {
    const onLookup = vi.fn();
    render(<LookupForm onLookup={onLookup} />);

    fireEvent.click(screen.getByRole("button", { name: /look up/i }));

    expect(
      await screen.findByText(/enter an asset tag or serial number/i),
    ).toBeInTheDocument();
    expect(onLookup).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only input and shows the validation error", async () => {
    const onLookup = vi.fn();
    render(<LookupForm onLookup={onLookup} />);

    const input = screen.getByLabelText(/asset tag or serial number/i);
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /look up/i }));

    expect(
      await screen.findByText(/enter an asset tag or serial number/i),
    ).toBeInTheDocument();
    expect(onLookup).not.toHaveBeenCalled();
  });
});
