"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import type { Asset } from "@/lib/inventory/types";

const assetSchema = z.object({
  tag: z.string().trim().min(1, "Tag is required").max(50, "Tag is too long"),
  serial: z
    .string()
    .trim()
    .min(1, "Serial is required")
    .max(100, "Serial is too long"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name is too long"),
  category: z.enum(["LAPTOP", "DESKTOP", "MONITOR", "PHONE", "ACCESSORY"]),
  status: z
    .enum(["AVAILABLE", "ASSIGNED", "IN_REPAIR", "RETIRED"])
    .default("AVAILABLE"),
  purchaseDate: z.string().nullable().optional(),
  purchaseCost: z.number().int().nullable().optional(),
  warrantyExpiresAt: z.string().nullable().optional(),
  vendorId: z.string().nullable().optional(),
});

type AssetInput = z.input<typeof assetSchema>;

export type MutationResult =
  | { success: true }
  | { success: false; error: string };

function serializeAsset(
  row: {
    id: string;
    tag: string;
    serial: string;
    name: string;
    category: string;
    status: string;
    purchaseDate: Date | null;
    purchaseCost: number | null;
    warrantyExpiresAt: Date | null;
    vendorId: string | null;
  } & Record<string, unknown>,
): Asset {
  return {
    id: row.id,
    tag: row.tag,
    serial: row.serial,
    name: row.name,
    category: row.category as Asset["category"],
    status: row.status as Asset["status"],
    purchaseDate: row.purchaseDate?.toISOString() ?? null,
    purchaseCost: row.purchaseCost,
    warrantyExpiresAt: row.warrantyExpiresAt?.toISOString() ?? null,
    vendorId: row.vendorId,
  };
}

export async function getAssets(
  search?: string,
): Promise<(Asset & { vendorName: string | null })[]> {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { tag: { contains: search, mode: "insensitive" as const } },
          { serial: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const rows = await prisma.asset.findMany({
    where,
    include: { vendor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    ...serializeAsset(row),
    vendorName: row.vendor?.name ?? null,
  }));
}

export interface AssetWithVendor extends Asset {
  vendorName: string | null;
  vendor: {
    id: string;
    name: string;
    contactEmail: string;
    contactPhone: string | null;
    website: string | null;
  } | null;
}

export async function getAsset(
  id: string,
): Promise<AssetWithVendor | null> {
  const row = await prisma.asset.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          contactEmail: true,
          contactPhone: true,
          website: true,
        },
      },
    },
  });

  if (!row) return null;

  return {
    ...serializeAsset(row),
    vendorName: row.vendor?.name ?? null,
    vendor: row.vendor,
  };
}

export async function createAsset(input: AssetInput): Promise<MutationResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = assetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid asset data",
    };
  }

  const data = parsed.data;

  await prisma.asset.create({
    data: {
      tag: data.tag,
      serial: data.serial,
      name: data.name,
      category: data.category,
      status: data.status,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      purchaseCost: data.purchaseCost ?? null,
      warrantyExpiresAt: data.warrantyExpiresAt
        ? new Date(data.warrantyExpiresAt)
        : null,
      vendorId: data.vendorId ?? null,
    },
  });

  revalidatePath("/inventory");
  return { success: true };
}

export async function updateAsset(
  id: string,
  input: AssetInput,
): Promise<MutationResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = assetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid asset data",
    };
  }

  const data = parsed.data;

  await prisma.asset.update({
    where: { id },
    data: {
      tag: data.tag,
      serial: data.serial,
      name: data.name,
      category: data.category,
      status: data.status,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      purchaseCost: data.purchaseCost ?? null,
      warrantyExpiresAt: data.warrantyExpiresAt
        ? new Date(data.warrantyExpiresAt)
        : null,
      vendorId: data.vendorId ?? null,
    },
  });

  revalidatePath("/inventory");
  return { success: true };
}

export async function deleteAsset(id: string): Promise<MutationResult> {
  await requireAdmin();

  await prisma.asset.delete({ where: { id } });

  revalidatePath("/inventory");
  return { success: true };
}
