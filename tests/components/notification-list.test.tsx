import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/lib/actions/notifications", () => ({
  markAsRead: vi.fn().mockResolvedValue({ success: true }),
  markAllAsRead: vi.fn().mockResolvedValue({ success: true }),
  dismissNotification: vi.fn().mockResolvedValue({ success: true }),
}));

import { NotificationList } from "@/app/(dashboard)/notifications/inbox/_components/notification-list";
import type { Notification } from "@/lib/notifications/types";

const sampleNotifications: Notification[] = [
  {
    id: "n_a",
    title: "Security alert",
    body: "Suspicious login.",
    category: "SECURITY",
    severity: "CRITICAL",
    read: false,
    createdAt: "2026-04-11T08:00:00.000Z",
  },
  {
    id: "n_b",
    title: "Warranty expiring",
    body: "Asset MBP-001.",
    category: "WARRANTY",
    severity: "WARNING",
    read: false,
    createdAt: "2026-04-10T12:00:00.000Z",
  },
  {
    id: "n_c",
    title: "Backup completed",
    body: "Nightly snapshot.",
    category: "SYSTEM",
    severity: "INFO",
    read: true,
    createdAt: "2026-04-10T03:00:00.000Z",
  },
  {
    id: "n_d",
    title: "Maintenance window",
    body: "Database upgrade.",
    category: "MAINTENANCE",
    severity: "INFO",
    read: false,
    createdAt: "2026-04-09T22:00:00.000Z",
  },
];

describe("NotificationList", () => {
  it("renders one item per notification in initialNotifications", () => {
    render(<NotificationList initialNotifications={sampleNotifications} />);

    expect(screen.getByText("Security alert")).toBeInTheDocument();
    expect(screen.getByText("Warranty expiring")).toBeInTheDocument();
    expect(screen.getByText("Backup completed")).toBeInTheDocument();
    expect(screen.getByText("Maintenance window")).toBeInTheDocument();
  });

  it("removes a notification from the list when dismiss is clicked", () => {
    render(<NotificationList initialNotifications={sampleNotifications} />);

    const securityItem = screen.getByTestId("notification-item-n_a");
    const dismissButton = securityItem.querySelector(
      'button:nth-of-type(2)'
    ) as HTMLButtonElement;
    fireEvent.click(dismissButton);

    expect(screen.queryByText("Security alert")).not.toBeInTheDocument();
    expect(screen.getByText("Warranty expiring")).toBeInTheDocument();
  });

  it("flips an item to read when its mark-as-read button is clicked", () => {
    render(<NotificationList initialNotifications={sampleNotifications} />);

    const securityItem = screen.getByTestId("notification-item-n_a");
    expect(securityItem).toHaveAttribute("data-read", "false");

    const markAsReadButton = securityItem.querySelector(
      "button"
    ) as HTMLButtonElement;
    fireEvent.click(markAsReadButton);

    expect(screen.getByTestId("notification-item-n_a")).toHaveAttribute(
      "data-read",
      "true"
    );
  });

  it("marks every notification as read when 'Mark all as read' is clicked", () => {
    render(<NotificationList initialNotifications={sampleNotifications} />);

    fireEvent.click(screen.getByRole("button", { name: /mark all as read/i }));

    for (const n of sampleNotifications) {
      expect(screen.getByTestId(`notification-item-${n.id}`)).toHaveAttribute(
        "data-read",
        "true"
      );
    }
  });

  it("hides read notifications when the show-read switch is toggled off", () => {
    render(<NotificationList initialNotifications={sampleNotifications} />);

    expect(screen.getByText("Backup completed")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Show read notifications"));

    expect(screen.queryByText("Backup completed")).not.toBeInTheDocument();
    expect(screen.getByText("Security alert")).toBeInTheDocument();
  });

  it("renders the empty state when no notifications match the filters", () => {
    const onlyRead: Notification[] = [
      { ...sampleNotifications[2] },
    ];
    render(<NotificationList initialNotifications={onlyRead} />);

    fireEvent.click(screen.getByLabelText("Show read notifications"));

    expect(screen.getByTestId("notification-empty-state")).toBeInTheDocument();
  });
});
