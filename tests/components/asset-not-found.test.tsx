import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AssetNotFound } from "@/app/(dashboard)/checkinout/_components/asset-not-found";

describe("AssetNotFound", () => {
  it("renders the query in the alert copy", () => {
    render(<AssetNotFound query="NOT-A-REAL-TAG" onClear={vi.fn()} />);
    expect(
      screen.getByText(/No asset matches .*NOT-A-REAL-TAG/),
    ).toBeInTheDocument();
  });

  it("calls onClear when the Clear button is clicked", () => {
    const onClear = vi.fn();
    render(<AssetNotFound query="UNKNOWN" onClear={onClear} />);
    fireEvent.click(screen.getByTestId("asset-not-found-clear"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
