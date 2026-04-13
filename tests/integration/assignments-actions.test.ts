import { beforeEach, describe, expect, it, vi } from "vitest";

const { requirePermissionMock, revalidatePathMock, prismaMock } = vi.hoisted(
  () => ({
    requirePermissionMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    prismaMock: {
      asset: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      checkEvent: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
      $transaction: vi.fn(),
    },
  }),
);

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/auth-guards", () => ({
  requirePermission: requirePermissionMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import {
  getCurrentAssignments,
  getAssignmentHistory,
  getDepartmentAllocation,
  unassignAsset,
} from "@/lib/actions/assignments";

const SESSION = {
  user: { id: "u_admin", email: "admin@test.com", name: "Admin", role: "ADMIN" },
};

describe("assignments server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermissionMock.mockResolvedValue(SESSION);
  });

  describe("getCurrentAssignments", () => {
    it("queries assets where currentAssigneeId is not null with includes", async () => {
      prismaMock.asset.findMany.mockResolvedValue([]);

      await getCurrentAssignments();

      expect(prismaMock.asset.findMany).toHaveBeenCalledTimes(1);
      const call = prismaMock.asset.findMany.mock.calls[0][0];
      expect(call.where).toEqual({ currentAssigneeId: { not: null } });
      expect(call.include.currentAssignee).toBeDefined();
      expect(call.include.checkEvents).toMatchObject({
        where: { type: "CHECK_OUT" },
        orderBy: { timestamp: "desc" },
        take: 1,
      });
      expect(call.orderBy).toEqual({ updatedAt: "desc" });
    });

    it("passes search filter with OR conditions when search is provided", async () => {
      prismaMock.asset.findMany.mockResolvedValue([]);

      await getCurrentAssignments("sara");

      const call = prismaMock.asset.findMany.mock.calls[0][0];
      expect(call.where.currentAssigneeId).toEqual({ not: null });
      expect(call.where.OR).toEqual([
        { name: { contains: "sara", mode: "insensitive" } },
        { tag: { contains: "sara", mode: "insensitive" } },
        {
          currentAssignee: {
            name: { contains: "sara", mode: "insensitive" },
          },
        },
      ]);
    });
  });

  describe("getDepartmentAllocation", () => {
    it("returns grouped counts by department", async () => {
      prismaMock.asset.findMany.mockResolvedValue([
        { currentAssignee: { department: "Engineering" } },
        { currentAssignee: { department: "Engineering" } },
        { currentAssignee: { department: "Marketing" } },
        { currentAssignee: { department: null } },
      ]);

      const result = await getDepartmentAllocation();

      expect(result).toEqual(
        expect.arrayContaining([
          { department: "Engineering", count: 2 },
          { department: "Marketing", count: 1 },
          { department: "Unassigned", count: 1 },
        ]),
      );
      expect(result).toHaveLength(3);
    });
  });

  describe("getAssignmentHistory", () => {
    it("queries check events for asset ordered by timestamp desc", async () => {
      prismaMock.checkEvent.findMany.mockResolvedValue([]);

      await getAssignmentHistory("asset_123");

      expect(prismaMock.checkEvent.findMany).toHaveBeenCalledWith({
        where: { assetId: "asset_123" },
        include: {
          user: { select: { id: true, name: true } },
          asset: { select: { id: true, tag: true, name: true } },
        },
        orderBy: { timestamp: "desc" },
      });
    });
  });

  describe("unassignAsset", () => {
    it("creates CHECK_IN event and updates asset in transaction", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "asset_1",
        status: "ASSIGNED",
        currentAssigneeId: "u_001",
      });
      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const result = await unassignAsset("asset_1");

      expect(result).toEqual({ success: true });
      expect(requirePermissionMock).toHaveBeenCalledWith("asset.update");
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

      const txArgs = prismaMock.$transaction.mock.calls[0][0];
      expect(txArgs).toHaveLength(2);

      expect(revalidatePathMock).toHaveBeenCalledWith("/assignments");
    });

    it("returns error when asset is not in ASSIGNED status", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "asset_1",
        status: "AVAILABLE",
        currentAssigneeId: null,
      });

      const result = await unassignAsset("asset_1");

      expect(result).toEqual({
        success: false,
        error: "Asset is not currently assigned.",
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it("returns error when asset does not exist", async () => {
      prismaMock.asset.findUnique.mockResolvedValue(null);

      const result = await unassignAsset("nonexistent");

      expect(result).toEqual({
        success: false,
        error: "Asset not found.",
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });
});
