"use server";

import { prisma } from "@/lib/prisma";

// ─── Types ─────────────────────────────────────────────

export type DashboardStats = {
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  totalUsers: number;
  totalVendors: number;
  unreadNotifications: number;
};

export type RecentActivity = {
  id: string;
  type: string;
  timestamp: string;
  notes: string | null;
  userName: string;
  assetName: string;
  assetTag: string;
};

export type StatusCount = {
  status: string;
  count: number;
};

export type CategoryCount = {
  category: string;
  count: number;
};

// ─── Actions ───────────────────────────────────────────

export async function getDashboardStats(): Promise<
  { success: true; data: DashboardStats } | { success: false; error: string }
> {
  try {
    const [
      totalAssets,
      assignedAssets,
      availableAssets,
      totalUsers,
      totalVendors,
      unreadNotifications,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "ASSIGNED" } }),
      prisma.asset.count({ where: { status: "AVAILABLE" } }),
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.notification.count({ where: { read: false } }),
    ]);

    return {
      success: true,
      data: {
        totalAssets,
        assignedAssets,
        availableAssets,
        totalUsers,
        totalVendors,
        unreadNotifications,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard stats",
    };
  }
}

export async function getRecentActivity(limit = 5): Promise<
  | { success: true; data: RecentActivity[] }
  | { success: false; error: string }
> {
  try {
    const events = await prisma.checkEvent.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      include: {
        user: { select: { name: true } },
        asset: { select: { name: true, tag: true } },
      },
    });

    const data: RecentActivity[] = events.map((event) => ({
      id: event.id,
      type: event.type,
      timestamp: event.timestamp.toISOString(),
      notes: event.notes,
      userName: event.user.name,
      assetName: event.asset.name,
      assetTag: event.asset.tag,
    }));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch recent activity",
    };
  }
}

export async function getAssetsByStatus(): Promise<
  { success: true; data: StatusCount[] } | { success: false; error: string }
> {
  try {
    const groups = await prisma.asset.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const data: StatusCount[] = groups.map((group) => ({
      status: group.status,
      count: group._count.id,
    }));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assets by status",
    };
  }
}

export async function getAssetsByCategory(): Promise<
  { success: true; data: CategoryCount[] } | { success: false; error: string }
> {
  try {
    const groups = await prisma.asset.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    const data: CategoryCount[] = groups.map((group) => ({
      category: group.category,
      count: group._count.id,
    }));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assets by category",
    };
  }
}
