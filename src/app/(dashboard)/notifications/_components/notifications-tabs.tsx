"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/notifications/inbox", label: "Inbox" },
  { href: "/notifications/preferences", label: "Preferences" },
] as const;

export function NotificationsTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Notifications sections"
      className="flex flex-wrap gap-1"
      data-testid="notifications-tabs"
    >
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-red-500/[0.08] text-[#c80000]"
                : "text-[#888888] hover:bg-red-500/[0.04] hover:text-[#7b0000]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
