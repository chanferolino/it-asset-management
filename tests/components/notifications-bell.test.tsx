import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/lib/actions/notifications", () => ({
  markAllAsRead: vi.fn().mockResolvedValue({ success: true }),
}));

import { NotificationsBell } from "@/components/notifications-bell";
import type { Notification } from "@/lib/notifications/types";

function makeNotification(
  overrides: Partial<Notification> & Pick<Notification, "id">
): Notification {
  return {
    title: "Sample",
    body: "Body",
    category: "SYSTEM",
    severity: "INFO",
    read: false,
    createdAt: "2026-04-11T08:00:00.000Z",
    ...overrides,
  };
}

describe("NotificationsBell", () => {
  it("renders an unread-count badge matching the number of unread notifications", () => {
    const notifications: Notification[] = [
      makeNotification({ id: "n1", read: false }),
      makeNotification({ id: "n2", read: false }),
      makeNotification({ id: "n3", read: true }),
    ];

    render(<NotificationsBell initialNotifications={notifications} />);

    const badge = screen.getByTestId("bell-badge");
    expect(badge).toHaveTextContent("2");
    expect(badge).toHaveAttribute("aria-label", "2 unread notifications");
  });

  it("caps the unread badge at 9+ for counts of 10 or more", () => {
    const notifications: Notification[] = Array.from({ length: 12 }, (_, i) =>
      makeNotification({ id: `n${i}`, read: false })
    );

    render(<NotificationsBell initialNotifications={notifications} />);

    expect(screen.getByTestId("bell-badge")).toHaveTextContent("9+");
  });

  it("hides the badge when there are no unread notifications", () => {
    const notifications: Notification[] = [
      makeNotification({ id: "n1", read: true }),
    ];

    render(<NotificationsBell initialNotifications={notifications} />);

    expect(screen.queryByTestId("bell-badge")).not.toBeInTheDocument();
  });

  it("opens the dropdown on click and renders up to five most recent items", () => {
    const notifications: Notification[] = [
      makeNotification({
        id: "newest",
        title: "Newest",
        createdAt: "2026-04-11T10:00:00.000Z",
      }),
      makeNotification({
        id: "middle",
        title: "Middle",
        createdAt: "2026-04-10T10:00:00.000Z",
      }),
      makeNotification({
        id: "oldest",
        title: "Oldest",
        createdAt: "2026-04-01T10:00:00.000Z",
      }),
    ];

    render(<NotificationsBell initialNotifications={notifications} />);

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    expect(screen.getByTestId("bell-item-newest")).toBeInTheDocument();
    expect(screen.getByTestId("bell-item-middle")).toBeInTheDocument();
    expect(screen.getByTestId("bell-item-oldest")).toBeInTheDocument();

    const viewAllLink = screen.getByRole("link", { name: /view all/i });
    expect(viewAllLink).toHaveAttribute("href", "/notifications/inbox");
  });

  it("limits the dropdown list to five items when more notifications exist", () => {
    const notifications: Notification[] = Array.from({ length: 8 }, (_, i) =>
      makeNotification({
        id: `n${i}`,
        title: `Item ${i}`,
        createdAt: new Date(2026, 3, 11 - i).toISOString(),
      })
    );

    render(<NotificationsBell initialNotifications={notifications} />);

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    const list = screen.getByTestId("bell-list");
    const items = list.querySelectorAll('[data-testid^="bell-item-"]');
    expect(items.length).toBe(5);
  });

  it("clears the badge and unread state when 'Mark all as read' is clicked", () => {
    const notifications: Notification[] = [
      makeNotification({ id: "n1", read: false }),
      makeNotification({ id: "n2", read: false }),
    ];

    render(<NotificationsBell initialNotifications={notifications} />);

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    fireEvent.click(screen.getByRole("button", { name: /mark all as read/i }));

    expect(screen.queryByTestId("bell-badge")).not.toBeInTheDocument();
  });

  it("renders the empty state when there are no notifications", () => {
    render(<NotificationsBell initialNotifications={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    expect(screen.getByTestId("bell-empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("bell-badge")).not.toBeInTheDocument();
  });
});
