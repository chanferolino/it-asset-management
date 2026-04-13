"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guards";
import type { Asset, CheckEvent, User } from "@/lib/checkinout/types";

// ─── Schemas ────────────────────────────────────────────

const lookupSchema = z.object({
  query: z.string().trim().min(1, "Query is required"),
});

const checkHistorySchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
});

const checkOutSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  userId: z.string().min(1, "User ID is required"),
  notes: z.string().max(500).optional(),
});

const checkInSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  notes: z.string().max(500).optional(),
});

// ─── Result types ───────────────────────────────────────

type LookupResult =
  | { success: true; asset: Asset; assignee: User | null; history: CheckEvent[] }
  | { success: false; error: string };

type CheckHistoryResult =
  | { success: true; events: CheckEvent[] }
  | { success: false; error: string };

type MutationResult =
  | { success: true }
  | { success: false; error: string };

type ActiveUsersResult =
  | { success: true; users: User[] }
  | { success: false; error: string };

// ─── Helpers ────────────────────────────────────────────

function serializeAsset(row: {
  id: string;
  tag: string;
  serial: string;
  name: string;
  category: string;
  status: string;
  currentAssigneeId: string | null;
}): Asset {
  return {
    id: row.id,
    tag: row.tag,
    serial: row.serial,
    name: row.name,
    category: row.category as Asset["category"],
    status: row.status as Asset["status"],
    currentAssigneeId: row.currentAssigneeId ?? undefined,
  };
}

function serializeEvent(row: {
  id: string;
  assetId: string;
  type: string;
  userId: string;
  timestamp: Date;
  notes: string | null;
}): CheckEvent {
  return {
    id: row.id,
    assetId: row.assetId,
    type: row.type as CheckEvent["type"],
    userId: row.userId,
    timestamp: row.timestamp.toISOString(),
    notes: row.notes ?? undefined,
  };
}

function serializeUser(row: {
  id: string;
  name: string;
  email: string;
  department: string | null;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department ?? undefined,
  };
}

// ─── Actions ────────────────────────────────────────────

export async function lookupAsset(query: string): Promise<LookupResult> {
  await requirePermission("asset.read");

  const parsed = lookupSchema.safeParse({ query });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid query" };
  }

  const normalized = parsed.data.query.toLowerCase();

  const asset = await prisma.asset.findFirst({
    where: {
      OR: [
        { tag: { equals: normalized, mode: "insensitive" } },
        { serial: { equals: normalized, mode: "insensitive" } },
      ],
    },
  });

  if (!asset) {
    return { success: false, error: "Asset not found" };
  }

  // Get assignee if assigned
  let assignee: User | null = null;
  if (asset.currentAssigneeId) {
    const user = await prisma.user.findUnique({
      where: { id: asset.currentAssigneeId },
      select: { id: true, name: true, email: true, department: true },
    });
    if (user) {
      assignee = serializeUser(user);
    }
  }

  // Get history
  const events = await prisma.checkEvent.findMany({
    where: { assetId: asset.id },
    orderBy: { timestamp: "desc" },
  });

  return {
    success: true,
    asset: serializeAsset(asset),
    assignee,
    history: events.map(serializeEvent),
  };
}

export async function getCheckHistory(assetId: string): Promise<CheckHistoryResult> {
  await requirePermission("asset.read");

  const parsed = checkHistorySchema.safeParse({ assetId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid asset ID" };
  }

  const events = await prisma.checkEvent.findMany({
    where: { assetId: parsed.data.assetId },
    orderBy: { timestamp: "desc" },
  });

  return {
    success: true,
    events: events.map(serializeEvent),
  };
}

export async function checkOutAsset(
  assetId: string,
  userId: string,
  notes?: string
): Promise<MutationResult> {
  await requirePermission("asset.update");

  const parsed = checkOutSchema.safeParse({ assetId, userId, notes });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const { assetId: aId, userId: uId, notes: n } = parsed.data;

  // Verify asset exists and is available
  const asset = await prisma.asset.findUnique({ where: { id: aId } });
  if (!asset) {
    return { success: false, error: "Asset not found" };
  }
  if (asset.status !== "AVAILABLE") {
    return { success: false, error: `Asset is currently ${asset.status.toLowerCase()} and cannot be checked out` };
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: uId } });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  await prisma.$transaction([
    prisma.checkEvent.create({
      data: {
        assetId: aId,
        type: "CHECK_OUT",
        userId: uId,
        notes: n?.trim() || null,
      },
    }),
    prisma.asset.update({
      where: { id: aId },
      data: {
        status: "ASSIGNED",
        currentAssigneeId: uId,
      },
    }),
  ]);

  revalidatePath("/checkinout");

  return { success: true };
}

export async function checkInAsset(
  assetId: string,
  notes?: string
): Promise<MutationResult> {
  await requirePermission("asset.update");

  const parsed = checkInSchema.safeParse({ assetId, notes });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const { assetId: aId, notes: n } = parsed.data;

  // Verify asset exists and is assigned
  const asset = await prisma.asset.findUnique({ where: { id: aId } });
  if (!asset) {
    return { success: false, error: "Asset not found" };
  }
  if (asset.status !== "ASSIGNED" || !asset.currentAssigneeId) {
    return { success: false, error: "Asset is not currently checked out" };
  }

  const returningUserId = asset.currentAssigneeId;

  await prisma.$transaction([
    prisma.checkEvent.create({
      data: {
        assetId: aId,
        type: "CHECK_IN",
        userId: returningUserId,
        notes: n?.trim() || null,
      },
    }),
    prisma.asset.update({
      where: { id: aId },
      data: {
        status: "AVAILABLE",
        currentAssigneeId: null,
      },
    }),
  ]);

  revalidatePath("/checkinout");

  return { success: true };
}

export async function getActiveUsers(): Promise<ActiveUsersResult> {
  await requirePermission("asset.read");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, department: true },
    orderBy: { name: "asc" },
  });

  return {
    success: true,
    users: users.map(serializeUser),
  };
}
