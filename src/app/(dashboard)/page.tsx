import {
  getDashboardStats,
  getRecentActivity,
  getAssetsByStatus,
  getAssetsByCategory,
} from "@/lib/actions/dashboard";
import { DashboardPageClient } from "./_components/dashboard-page-client";
import type {
  DashboardStats,
  RecentActivity,
  StatusCount,
  CategoryCount,
} from "./_components/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [statsResult, activityResult, statusResult, categoryResult] =
    await Promise.all([
      getDashboardStats(),
      getRecentActivity(),
      getAssetsByStatus(),
      getAssetsByCategory(),
    ]);

  const stats: DashboardStats = statsResult.success
    ? statsResult.data
    : {
        totalAssets: 0,
        assignedAssets: 0,
        availableAssets: 0,
        totalUsers: 0,
        totalVendors: 0,
        unreadNotifications: 0,
      };

  const recentActivity: RecentActivity[] = activityResult.success
    ? (activityResult.data as RecentActivity[])
    : [];

  const assetsByStatus: StatusCount[] = statusResult.success
    ? statusResult.data
    : [];

  const assetsByCategory: CategoryCount[] = categoryResult.success
    ? categoryResult.data
    : [];

  return (
    <DashboardPageClient
      stats={stats}
      recentActivity={recentActivity}
      assetsByStatus={assetsByStatus}
      assetsByCategory={assetsByCategory}
    />
  );
}
