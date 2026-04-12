import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WarrantyAlertBanner } from "@/app/(dashboard)/inventory/_components/warranty-alert-banner";

describe("WarrantyAlertBanner", () => {
  it("renders plural copy for counts > 1", () => {
    render(
      <WarrantyAlertBanner
        expiredCount={2}
        expiringCount={3}
        dismissed={false}
        onDismiss={vi.fn()}
        onViewExpired={vi.fn()}
        onViewExpiring={vi.fn()}
      />,
    );
    expect(screen.getByTestId("warranty-alert-copy")).toHaveTextContent(
      "2 warranties expired, 3 expiring within 30 days",
    );
  });

  it("uses singular 'warranty' when expiredCount is 1", () => {
    render(
      <WarrantyAlertBanner
        expiredCount={1}
        expiringCount={1}
        dismissed={false}
        onDismiss={vi.fn()}
        onViewExpired={vi.fn()}
        onViewExpiring={vi.fn()}
      />,
    );
    expect(screen.getByTestId("warranty-alert-copy")).toHaveTextContent(
      "1 warranty expired, 1 expiring within 30 days",
    );
  });

  it("hides the 'View expired' button when expiredCount is 0", () => {
    render(
      <WarrantyAlertBanner
        expiredCount={0}
        expiringCount={3}
        dismissed={false}
        onDismiss={vi.fn()}
        onViewExpired={vi.fn()}
        onViewExpiring={vi.fn()}
      />,
    );
    expect(
      screen.queryByTestId("warranty-alert-view-expired"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("warranty-alert-view-expiring"),
    ).toBeInTheDocument();
  });

  it("renders nothing when both counts are zero", () => {
    const { container } = render(
      <WarrantyAlertBanner
        expiredCount={0}
        expiringCount={0}
        dismissed={false}
        onDismiss={vi.fn()}
        onViewExpired={vi.fn()}
        onViewExpiring={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when dismissed", () => {
    const { container } = render(
      <WarrantyAlertBanner
        expiredCount={5}
        expiringCount={5}
        dismissed={true}
        onDismiss={vi.fn()}
        onViewExpired={vi.fn()}
        onViewExpiring={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onViewExpired when View expired is clicked", () => {
    const onViewExpired = vi.fn();
    render(
      <WarrantyAlertBanner
        expiredCount={2}
        expiringCount={3}
        dismissed={false}
        onDismiss={vi.fn()}
        onViewExpired={onViewExpired}
        onViewExpiring={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("warranty-alert-view-expired"));
    expect(onViewExpired).toHaveBeenCalledTimes(1);
  });

  it("calls onViewExpiring when View expiring is clicked", () => {
    const onViewExpiring = vi.fn();
    render(
      <WarrantyAlertBanner
        expiredCount={2}
        expiringCount={3}
        dismissed={false}
        onDismiss={vi.fn()}
        onViewExpired={vi.fn()}
        onViewExpiring={onViewExpiring}
      />,
    );
    fireEvent.click(screen.getByTestId("warranty-alert-view-expiring"));
    expect(onViewExpiring).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when the X button is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <WarrantyAlertBanner
        expiredCount={2}
        expiringCount={3}
        dismissed={false}
        onDismiss={onDismiss}
        onViewExpired={vi.fn()}
        onViewExpiring={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("warranty-alert-dismiss"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
