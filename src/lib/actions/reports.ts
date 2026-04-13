"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guards";
import type { AuditAction } from "@/generated/prisma";

// ─── Types ─────────────────────────────────────────────

type AssetReportResult =
  | {
      success: true;
      data: {
        total: number;
        byStatus: { status: string; count: number }[];
        byCategory: { category: string; count: number }[];
      };
    }
  | { success: false; error: string };

type TicketReportResult =
  | {
      success: true;
      data: {
        total: number;
        byStatus: { status: string; count: number }[];
        byPriority: { priority: string; count: number }[];
        avgResolutionTimeHours: number;
      };
    }
  | { success: false; error: string };

type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  user: { id: string; name: string } | null;
};

type AuditLogsResult =
  | { success: true; data: AuditLogEntry[] }
  | { success: false; error: string };

type AuditLogCountResult =
  | { success: true; count: number }
  | { success: false; error: string };

type OverviewStatsResult =
  | {
      success: true;
      data: {
        totalAssets: number;
        totalUsers: number;
        totalOpenTickets: number;
        totalVendors: number;
      };
    }
  | { success: false; error: string };

interface AuditLogFilters {
  entity?: string;
  action?: AuditAction;
  dateFrom?: Date;
  dateTo?: Date;
  take?: number;
  skip?: number;
}

// ─── Helpers ───────────────────────────────────────────

function buildAuditWhere(filters?: AuditLogFilters) {
  if (!filters) return {};

  const where: Record<string, unknown> = {};

  if (filters.entity) where.entity = filters.entity;
  if (filters.action) where.action = filters.action;

  if (filters.dateFrom || filters.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (filters.dateFrom) createdAt.gte = filters.dateFrom;
    if (filters.dateTo) createdAt.lte = filters.dateTo;
    where.createdAt = createdAt;
  }

  return where;
}

// ─── Actions ───────────────────────────────────────────

export async function getAssetReport(): Promise<AssetReportResult> {
  await requirePermission("report.read");

  const [total, byStatus, byCategory] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.asset.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ]);

  return {
    success: true,
    data: {
      total,
      byStatus: byStatus.map((g) => ({ status: g.status, count: g._count.id })),
      byCategory: byCategory.map((g) => ({
        category: g.category,
        count: g._count.id,
      })),
    },
  };
}

export async function getTicketReport(): Promise<TicketReportResult> {
  await requirePermission("report.read");

  try {
    const totalRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM tickets
    `;
    const total = Number(totalRows[0]?.count ?? 0);

    const byStatusRows = await prisma.$queryRaw<
      { status: string; count: bigint }[]
    >`SELECT status, COUNT(*)::bigint AS count FROM tickets GROUP BY status`;

    const byPriorityRows = await prisma.$queryRaw<
      { priority: string; count: bigint }[]
    >`SELECT priority, COUNT(*)::bigint AS count FROM tickets GROUP BY priority`;

    const avgRows = await prisma.$queryRaw<{ avg_hours: number | null }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::float AS avg_hours
      FROM tickets
      WHERE resolved_at IS NOT NULL
    `;

    return {
      success: true,
      data: {
        total,
        byStatus: byStatusRows.map((r) => ({ status: r.status, count: Number(r.count) })),
        byPriority: byPriorityRows.map((r) => ({
          priority: r.priority,
          count: Number(r.count),
        })),
        avgResolutionTimeHours: Math.round(avgRows[0]?.avg_hours ?? 0),
      },
    };
  } catch {
    // Ticket table may not exist yet
    return {
      success: true,
      data: {
        total: 0,
        byStatus: [],
        byPriority: [],
        avgResolutionTimeHours: 0,
      },
    };
  }
}

export async function getAuditLogs(
  filters?: AuditLogFilters,
): Promise<AuditLogsResult> {
  await requirePermission("report.read");

  const where = buildAuditWhere(filters);

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: filters?.take ?? 50,
    skip: filters?.skip ?? 0,
  });

  return {
    success: true,
    data: logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    })),
  };
}

export async function getAuditLogCount(
  filters?: AuditLogFilters,
): Promise<AuditLogCountResult> {
  await requirePermission("report.read");

  const where = buildAuditWhere(filters);
  const count = await prisma.auditLog.count({ where });

  return { success: true, count };
}

export async function getOverviewStats(): Promise<OverviewStatsResult> {
  await requirePermission("report.read");

  let totalOpenTickets = 0;
  try {
    const rows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM tickets
      WHERE status IN ('NEW', 'IN_PROGRESS')
    `;
    totalOpenTickets = Number(rows[0]?.count ?? 0);
  } catch {
    // Ticket table may not exist yet
  }

  const [totalAssets, totalUsers, totalVendors] = await Promise.all([
    prisma.asset.count(),
    prisma.user.count(),
    prisma.vendor.count(),
  ]);

  return {
    success: true,
    data: {
      totalAssets,
      totalUsers,
      totalOpenTickets,
      totalVendors,
    },
  };
}
