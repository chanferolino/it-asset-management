"use client";

import Link from "next/link";
import {
  Package,
  UserCheck,
  CheckCircle,
  Users,
  Store,
  Bell,
  Plus,
  TicketPlus,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DashboardStats,
  RecentActivity,
  StatusCount,
  CategoryCount,
} from "./types";

// ─── Helpers ────────────────────────────────────────────

function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return "just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  ASSIGNED: "bg-amber-500",
  IN_REPAIR: "bg-orange-500",
  RETIRED: "bg-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  IN_REPAIR: "In Repair",
  RETIRED: "Retired",
};

const CATEGORY_LABELS: Record<string, string> = {
  LAPTOP: "Laptop",
  DESKTOP: "Desktop",
  MONITOR: "Monitor",
  PHONE: "Phone",
  ACCESSORY: "Accessory",
};

// ─── Props ──────────────────────────────────────────────

type DashboardPageClientProps = {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  assetsByStatus: StatusCount[];
  assetsByCategory: CategoryCount[];
};

// ─── Component ──────────────────────────────────────────

export function DashboardPageClient({
  stats,
  recentActivity,
  assetsByStatus,
  assetsByCategory,
}: DashboardPageClientProps) {
  const totalForStatusBars = assetsByStatus.reduce((s, a) => s + a.count, 0);
  const totalForCategoryBars = assetsByCategory.reduce(
    (s, a) => s + a.count,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Dashboard
        </h1>
        <p className="mt-1 text-[#888888]">
          Overview of IT operations and key metrics
        </p>
      </div>

      {/* Metric Cards */}
      <div className="flex flex-wrap gap-4">
        <MetricCard
          icon={Package}
          label="Total Assets"
          value={stats.totalAssets}
          sub="assets tracked"
        />
        <MetricCard
          icon={UserCheck}
          label="Assigned"
          value={stats.assignedAssets}
          sub="devices in use"
        />
        <MetricCard
          icon={CheckCircle}
          label="Available"
          value={stats.availableAssets}
          sub="ready to assign"
        />
        <MetricCard
          icon={Users}
          label="Users"
          value={stats.totalUsers}
          sub="active users"
        />
        <MetricCard
          icon={Store}
          label="Vendors"
          value={stats.totalVendors}
          sub="vendors"
        />
        <MetricCard
          icon={Bell}
          label="Unread Alerts"
          value={stats.unreadNotifications}
          sub="notifications"
          alert={stats.unreadNotifications > 0}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#555555]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-sm font-medium text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            Add Asset <Plus className="h-4 w-4" />
          </Link>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-sm font-medium text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            New Ticket <TicketPlus className="h-4 w-4" />
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-2 text-sm font-medium text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            View Reports <BarChart3 className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Asset Distribution */}
        <div className="space-y-6">
          {/* By Status */}
          <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Assets by Status
            </h2>
            <div className="space-y-3">
              {assetsByStatus.map((item) => {
                const pct =
                  totalForStatusBars > 0
                    ? Math.round((item.count / totalForStatusBars) * 100)
                    : 0;
                return (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#300000]">
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                      <span className="text-[#888888]">{item.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f5f5f5]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          STATUS_COLORS[item.status] ?? "bg-gray-400"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {assetsByStatus.length === 0 && (
                <p className="text-sm text-[#888888]">No assets found</p>
              )}
            </div>
          </div>

          {/* By Category */}
          <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Assets by Category
            </h2>
            <div className="space-y-3">
              {assetsByCategory.map((item) => {
                const pct =
                  totalForCategoryBars > 0
                    ? Math.round((item.count / totalForCategoryBars) * 100)
                    : 0;
                return (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#300000]">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </span>
                      <span className="text-[#888888]">{item.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f5f5f5]">
                      <div
                        className="h-full rounded-full bg-[#c80000]/70 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {assetsByCategory.length === 0 && (
                <p className="text-sm text-[#888888]">No assets found</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl border border-[#e0e0e0]/50 bg-white/40 p-3"
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold",
                    event.type === "CHECK_OUT"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {event.type === "CHECK_OUT" ? "OUT" : "IN"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#300000]">
                    {event.assetName}
                    <span className="ml-1 text-[#888888]">
                      ({event.assetTag})
                    </span>
                  </p>
                  <p className="text-xs text-[#888888]">
                    {event.userName}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#bbbbbb]">
                  {relativeTime(event.timestamp)}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-[#888888]">No recent activity</p>
            )}
          </div>
          <Link
            href="/assignments"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#c80000] transition-all hover:text-[#7b0000]"
          >
            View all assignments <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MetricCard ─────────────────────────────────────────

type MetricCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
  alert?: boolean;
};

function MetricCard({ icon: Icon, label, value, sub, alert }: MetricCardProps) {
  return (
    <div
      className={cn(
        "min-w-[150px] flex-1 rounded-2xl border p-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl",
        alert
          ? "border-[#c80000]/20 bg-[#c80000]/[0.06]"
          : "border-white/80 bg-white/70"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4",
            alert ? "text-[#c80000]" : "text-[#888888]"
          )}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-3xl font-bold",
          alert ? "text-[#c80000]" : "text-[#300000]"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-[#888888]">{sub}</p>
    </div>
  );
}
