import type { Asset } from "@/lib/inventory/types";
import type { Vendor } from "./types";

export function findVendorById(
  vendors: Vendor[],
  id: string,
): Vendor | null {
  if (!id) return null;
  return vendors.find((v) => v.id === id) ?? null;
}

export function countAssetsForVendor(
  assets: Asset[],
  vendorId: string,
): number {
  if (!vendorId) return 0;
  return assets.filter((a) => a.vendorId === vendorId).length;
}
