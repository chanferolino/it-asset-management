import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { NotificationFilters } from "@/app/(dashboard)/notifications/inbox/_components/notification-filters";

function setup(overrides: Partial<React.ComponentProps<typeof NotificationFilters>> = {}) {
  const props = {
    category: "ALL" as const,
    showRead: true,
    hasUnread: true,
    onCategoryChange: vi.fn(),
    onShowReadChange: vi.fn(),
    onMarkAllRead: vi.fn(),
    ...overrides,
  };
  render(<NotificationFilters {...props} />);
  return props;
}

describe("NotificationFilters", () => {
  it("renders the category select, show-read switch, and mark-all button", () => {
    setup();

    expect(screen.getByLabelText("Filter by category")).toBeInTheDocument();
    expect(screen.getByLabelText("Show read notifications")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark all as read/i })
    ).toBeInTheDocument();
  });

  it("calls onShowReadChange when the switch is toggled", () => {
    const props = setup();

    fireEvent.click(screen.getByLabelText("Show read notifications"));

    expect(props.onShowReadChange).toHaveBeenCalledTimes(1);
    expect(props.onShowReadChange.mock.calls[0]?.[0]).toBe(false);
  });

  it("calls onMarkAllRead when the mark-all button is clicked", () => {
    const props = setup();

    fireEvent.click(screen.getByRole("button", { name: /mark all as read/i }));

    expect(props.onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("disables the mark-all button when there are no unread notifications", () => {
    setup({ hasUnread: false });

    expect(
      screen.getByRole("button", { name: /mark all as read/i })
    ).toBeDisabled();
  });
});
