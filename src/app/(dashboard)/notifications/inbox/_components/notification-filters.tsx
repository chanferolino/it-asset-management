"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  type NotificationCategory,
} from "@/lib/notifications/types";

export type CategoryFilter = "ALL" | NotificationCategory;

interface NotificationFiltersProps {
  category: CategoryFilter;
  showRead: boolean;
  hasUnread: boolean;
  onCategoryChange: (category: CategoryFilter) => void;
  onShowReadChange: (showRead: boolean) => void;
  onMarkAllRead: () => void;
}

export function NotificationFilters({
  category,
  showRead,
  hasUnread,
  onCategoryChange,
  onShowReadChange,
  onMarkAllRead,
}: NotificationFiltersProps) {
  return (
    <div
      data-testid="notification-filters"
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/80 bg-white/60 p-3 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
          Category
        </label>
        <Select
          value={category}
          onValueChange={(value) => onCategoryChange(value as CategoryFilter)}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} label={NOTIFICATION_CATEGORY_LABELS[cat]}>
                {NOTIFICATION_CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="show-read-toggle"
          className="text-xs font-semibold uppercase tracking-wide text-[#555555]"
        >
          Show read
        </label>
        <div className="flex h-10 items-center">
          <Switch
            id="show-read-toggle"
            checked={showRead}
            onCheckedChange={onShowReadChange}
            aria-label="Show read notifications"
          />
        </div>
      </div>

      <div className="ml-auto flex items-end">
        <Button
          type="button"
          onClick={onMarkAllRead}
          disabled={!hasUnread}
          className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-sm text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </Button>
      </div>
    </div>
  );
}
