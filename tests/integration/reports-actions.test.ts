import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, requirePermissionMock } = vi.hoisted(() => ({
  prismaMock: {
    asset: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    vendor: {
      count: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
  requirePermissionMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/auth-guards", () => ({
  requirePermission: requirePermissionMock,
  requireAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  getAssetReport,
  getOverviewStats,
  getAuditLogs,
  getAuditLogCount,
} from "@/lib/actions/reports";

describe("report server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermissionMock.mockResolvedValue({
      user: { id: "admin1", email: "admin@test.com", name: "Admin", role: "ADMIN" },
    });
  });

  describe("getAssetReport", () => {
    it("calls groupBy for status and category counts", async () => {
      prismaMock.asset.count.mockResolvedValue(10);
      prismaMock.asset.groupBy
        .mockResolvedValueOnce([
          { status: "ACTIVE", _count: { id: 7 } },
          { status: "RETIRED", _count: { id: 3 } },
        ])
        .mockResolvedValueOnce([
          { category: "LAPTOP", _count: { id: 6 } },
          { category: "MONITOR", _count: { id: 4 } },
        ]);

      const result = await getAssetReport();

      expect(requirePermissionMock).toHaveBeenCalledWith("report.read");
      expect(prismaMock.asset.groupBy).toHaveBeenCalledWith({
        by: ["status"],
        _count: { id: true },
      });
      expect(prismaMock.asset.groupBy).toHaveBeenCalledWith({
        by: ["category"],
        _count: { id: true },
      });
      expect(result).toEqual({
        success: true,
        data: {
          total: 10,
          byStatus: [
            { status: "ACTIVE", count: 7 },
            { status: "RETIRED", count: 3 },
          ],
          byCategory: [
            { category: "LAPTOP", count: 6 },
            { category: "MONITOR", count: 4 },
          ],
        },
      });
    });
  });

  describe("getOverviewStats", () => {
    it("returns correct counts", async () => {
      prismaMock.$queryRaw.mockResolvedValue([{ count: BigInt(5) }]);
      prismaMock.asset.count.mockResolvedValue(20);
      prismaMock.user.count.mockResolvedValue(8);
      prismaMock.vendor.count.mockResolvedValue(3);

      const result = await getOverviewStats();

      expect(result).toEqual({
        success: true,
        data: {
          totalAssets: 20,
          totalUsers: 8,
          totalOpenTickets: 5,
          totalVendors: 3,
        },
      });
    });
  });

  describe("getAuditLogs", () => {
    it("returns paginated results with user names", async () => {
      const mockLogs = [
        {
          id: "log1",
          action: "CREATE",
          entity: "Asset",
          entityId: "asset_1",
          details: null,
          createdAt: new Date("2026-01-15T10:00:00Z"),
          user: { id: "u1", name: "Alice" },
        },
        {
          id: "log2",
          action: "UPDATE",
          entity: "Asset",
          entityId: "asset_2",
          details: '{"field":"status"}',
          createdAt: new Date("2026-01-14T09:00:00Z"),
          user: null,
        },
      ];

      prismaMock.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await getAuditLogs({ take: 10, skip: 0 });

      expect(result).toEqual({
        success: true,
        data: [
          {
            id: "log1",
            action: "CREATE",
            entity: "Asset",
            entityId: "asset_1",
            details: null,
            createdAt: "2026-01-15T10:00:00.000Z",
            user: { id: "u1", name: "Alice" },
          },
          {
            id: "log2",
            action: "UPDATE",
            entity: "Asset",
            entityId: "asset_2",
            details: '{"field":"status"}',
            createdAt: "2026-01-14T09:00:00.000Z",
            user: null,
          },
        ],
      });

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });

    it("with entity filter passes correct where clause", async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);

      await getAuditLogs({ entity: "Vendor", take: 50, skip: 0 });

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entity: "Vendor" },
        }),
      );
    });
  });

  describe("getAuditLogCount", () => {
    it("returns count with filters", async () => {
      prismaMock.auditLog.count.mockResolvedValue(42);

      const result = await getAuditLogCount({ entity: "Asset", action: "CREATE" });

      expect(result).toEqual({ success: true, count: 42 });
      expect(prismaMock.auditLog.count).toHaveBeenCalledWith({
        where: { entity: "Asset", action: "CREATE" },
      });
    });
  });
});
