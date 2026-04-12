"use client";

import { useMemo, useState } from "react";
import type { Notification } from "@/lib/notifications/types";
import { NotificationItem } from "./notification-item";
import {
  NotificationFilters,
  type CategoryFilter,
} from "./notification-filters";

interface NotificationListProps {
  initialNotifications: Notification[];
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [showRead, setShowRead] = useState<boolean>(true);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (category !== "ALL" && n.category !== category) return false;
      if (!showRead && n.read) return false;
      return true;
    });
  }, [notifications, category, showRead]);

  const hasUnread = notifications.some((n) => !n.read);

  function handleMarkAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="space-y-4" data-testid="notification-list">
      <NotificationFilters
        category={category}
        showRead={showRead}
        hasUnread={hasUnread}
        onCategoryChange={setCategory}
        onShowReadChange={setShowRead}
        onMarkAllRead={handleMarkAllRead}
      />

      {filtered.length === 0 ? (
        <div
          data-testid="notification-empty-state"
          className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white/40 p-8 text-center text-sm text-[#888888]"
        >
          No notifications match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
