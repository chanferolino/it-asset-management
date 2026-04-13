"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import type { Vendor } from "@/lib/vendors/types";
import type { Asset } from "@/lib/inventory/types";

const vendorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a vendor name")
    .max(100, "Vendor name is too long"),
  contactEmail: z
    .string()
    .trim()
    .min(1, "Enter a contact email")
    .email("Enter a valid email"),
  contactPhone: z
    .string()
    .trim()
    .max(30, "Phone is too long")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

type VendorInput = z.input<typeof vendorSchema>;

export type MutationResult =
  | { success: true }
  | { success: false; error: string };

export interface VendorWithCount extends Vendor {
  assetCount: number;
}

export async function getVendors(): Promise<VendorWithCount[]> {
  const rows = await prisma.vendor.findMany({
    include: { _count: { select: { assets: true } } },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone ?? undefined,
    website: row.website ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    assetCount: row._count.assets,
  }));
}

export async function getVendor(
  id: string,
): Promise<{ vendor: Vendor; assets: Asset[] } | null> {
  const row = await prisma.vendor.findUnique({
    where: { id },
    include: { assets: true },
  });

  if (!row) return null;

  const vendor: Vendor = {
    id: row.id,
    name: row.name,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone ?? undefined,
    website: row.website ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };

  const assets: Asset[] = row.assets.map((a) => ({
    id: a.id,
    tag: a.tag,
    serial: a.serial,
    name: a.name,
    category: a.category as Asset["category"],
    status: a.status as Asset["status"],
    purchaseDate: a.purchaseDate?.toISOString() ?? null,
    purchaseCost: a.purchaseCost,
    warrantyExpiresAt: a.warrantyExpiresAt?.toISOString() ?? null,
    vendorId: a.vendorId,
  }));

  return { vendor, assets };
}

export async function createVendor(
  input: VendorInput,
): Promise<MutationResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = vendorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid vendor data",
    };
  }

  const data = parsed.data;

  await prisma.vendor.create({
    data: {
      name: data.name,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || null,
      website: data.website || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/vendors");
  return { success: true };
}

export async function updateVendor(
  id: string,
  input: VendorInput,
): Promise<MutationResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = vendorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid vendor data",
    };
  }

  const data = parsed.data;

  await prisma.vendor.update({
    where: { id },
    data: {
      name: data.name,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || null,
      website: data.website || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/vendors");
  return { success: true };
}

export async function deleteVendor(id: string): Promise<MutationResult> {
  await requireAdmin();

  await prisma.vendor.delete({ where: { id } });

  revalidatePath("/vendors");
  return { success: true };
}
