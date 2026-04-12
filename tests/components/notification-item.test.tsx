import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { NotificationItem } from "@/app/(dashboard)/notifications/inbox/_components/notification-item";
import type { Notification } from "@/lib/notifications/types";

const baseNotification: Notification = {
  id: "n_test",
  title: "Test alert",
  body: "Something happened.",
  category: "SYSTEM",
  severity: "INFO",
  read: false,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

function renderItem(overrides: Partial<Notification> = {}) {
  const onMarkAsRead = vi.fn();
  const onDismiss = vi.fn();
  const notification = { ...baseNotification, ...overrides };
  render(
    <NotificationItem
      notification={notification}
      onMarkAsRead={onMarkAsRead}
      onDismiss={onDismiss}
    />
  );
  return { onMarkAsRead, onDismiss, notification };
}

describe("NotificationItem", () => {
  it("renders title, body, category label, and severity badge", () => {
    renderItem({
      title: "Backup completed",
      body: "Snapshot stored.",
      category: "SYSTEM",
      severity: "INFO",
    });

    expect(screen.getByText("Backup completed")).toBeInTheDocument();
    expect(screen.getByText("Snapshot stored.")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("renders the unread badge and mark-as-read button when unread", () => {
    renderItem({ read: false });

    expect(screen.getByText("Unread")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark as read/i })
    ).toBeInTheDocument();
  });

  it("hides the mark-as-read button when already read", () => {
    renderItem({ read: true });

    expect(screen.queryByText("Unread")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /mark as read/i })
    ).not.toBeInTheDocument();
  });

  it("renders the Critical badge for critical severity", () => {
    renderItem({ severity: "CRITICAL" });
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("calls onMarkAsRead with the notification id when the button is clicked", () => {
    const { onMarkAsRead, notification } = renderItem({ read: false });

    fireEvent.click(screen.getByRole("button", { name: /mark as read/i }));

    expect(onMarkAsRead).toHaveBeenCalledTimes(1);
    expect(onMarkAsRead).toHaveBeenCalledWith(notification.id);
  });

  it("calls onDismiss with the notification id when dismiss is clicked", () => {
    const { onDismiss, notification } = renderItem();

    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(notification.id);
  });
});
