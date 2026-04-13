import { Package, Users, Ticket, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OverviewStats } from "./types";

const cards = [
  { key: "totalAssets", label: "Total Assets", icon: Package },
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "openTickets", label: "Open Tickets", icon: Ticket },
  { key: "totalVendors", label: "Total Vendors", icon: Store },
] as const;

export function OverviewTab({ stats }: { stats: OverviewStats }) {
  return (
    <div className="flex flex-wrap gap-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className={cn(
            "min-w-[140px] flex-1 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/[0.08]">
              <Icon className="size-5 text-[#c80000]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                {label}
              </p>
              <p className="text-2xl font-bold tracking-tight text-[#300000]">
                {stats[key]}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
