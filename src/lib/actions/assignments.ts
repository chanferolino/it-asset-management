"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guards";

export type ActionResult = { success: true } | { success: false; error: string };

export async function getCurrentAssignments(search?: string) {
  const where: Prisma.AssetWhereInput = {
    currentAssigneeId: { not: null },
  };

  if (search) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { tag: { contains: term, mode: "insensitive" } },
      {
        currentAssignee: {
          name: { contains: term, mode: "insensitive" },
        },
      },
    ];
  }

  const assets = await prisma.asset.findMany({
    where,
    include: {
      currentAssignee: {
        select: { id: true, name: true, email: true, department: true },
      },
      checkEvents: {
        where: { type: "CHECK_OUT" },
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return assets;
}

export async function getAssignmentHistory(assetId: string) {
  const events = await prisma.checkEvent.findMany({
    where: { assetId },
    include: {
      user: { select: { id: true, name: true } },
      asset: { select: { id: true, tag: true, name: true } },
    },
    orderBy: { timestamp: "desc" },
  });

  return events;
}

export async function getDepartmentAllocation() {
  const assets = await prisma.asset.findMany({
    where: { currentAssigneeId: { not: null } },
    select: {
      currentAssignee: {
        select: { department: true },
      },
    },
  });

  const counts = new Map<string, number>();
  for (const asset of assets) {
    const dept = asset.currentAssignee?.department ?? "Unassigned";
    counts.set(dept, (counts.get(dept) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([department, count]) => ({
    department,
    count,
  }));
}

export async function unassignAsset(assetId: string): Promise<ActionResult> {
  const session = await requirePermission("asset.update");

  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true, status: true, currentAssigneeId: true },
    });

    if (!asset) {
      return { success: false, error: "Asset not found." };
    }

    if (asset.status !== "ASSIGNED" || !asset.currentAssigneeId) {
      return { success: false, error: "Asset is not currently assigned." };
    }

    await prisma.$transaction([
      prisma.checkEvent.create({
        data: {
          assetId,
          type: "CHECK_IN",
          userId: session.user.id,
        },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: {
          currentAssigneeId: null,
          status: "AVAILABLE",
        },
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Asset not found." };
    }
    throw error;
  }

  revalidatePath("/assignments");

  return { success: true };
}
