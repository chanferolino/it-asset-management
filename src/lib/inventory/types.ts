export type AssetStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_REPAIR"
  | "RETIRED";

export type AssetCategory =
  | "LAPTOP"
  | "DESKTOP"
  | "MONITOR"
  | "PHONE"
  | "ACCESSORY";

export interface Asset {
  id: string;
  tag: string;
  serial: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  purchaseDate: string | null;
  purchaseCost: number | null;
  warrantyExpiresAt: string | null;
  vendorId: string | null;
}

export const ASSET_STATUSES: AssetStatus[] = [
  "AVAILABLE",
  "ASSIGNED",
  "IN_REPAIR",
  "RETIRED",
];

export const ASSET_CATEGORIES: AssetCategory[] = [
  "LAPTOP",
  "DESKTOP",
  "MONITOR",
  "PHONE",
  "ACCESSORY",
];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  IN_REPAIR: "In repair",
  RETIRED: "Retired",
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  LAPTOP: "Laptop",
  DESKTOP: "Desktop",
  MONITOR: "Monitor",
  PHONE: "Phone",
  ACCESSORY: "Accessory",
};
