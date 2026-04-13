export type InventoryAsset = {
  id: string;
  tag: string;
  serial: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  currentAssigneeId: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;
  warrantyExpiresAt: string | null;
  vendorId: string | null;
  vendor: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetCategory =
  | "LAPTOP"
  | "DESKTOP"
  | "MONITOR"
  | "PHONE"
  | "ACCESSORY";

export type AssetStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_REPAIR"
  | "RETIRED";

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  LAPTOP: "Laptop",
  DESKTOP: "Desktop",
  MONITOR: "Monitor",
  PHONE: "Phone",
  ACCESSORY: "Accessory",
};

export const STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  IN_REPAIR: "In Repair",
  RETIRED: "Retired",
};

export const CATEGORY_BADGE_CLASSES: Record<AssetCategory, string> = {
  LAPTOP: "bg-blue-500/[0.08] text-blue-700",
  DESKTOP: "bg-purple-500/[0.08] text-purple-700",
  MONITOR: "bg-teal-500/[0.08] text-teal-700",
  PHONE: "bg-amber-500/[0.08] text-amber-700",
  ACCESSORY: "bg-gray-500/[0.08] text-[#555555]",
};

export const STATUS_BADGE_CLASSES: Record<AssetStatus, string> = {
  AVAILABLE: "bg-green-500/[0.08] text-green-700",
  ASSIGNED: "bg-blue-500/[0.08] text-blue-700",
  IN_REPAIR: "bg-amber-500/[0.08] text-amber-700",
  RETIRED: "bg-gray-500/[0.08] text-[#888888]",
};
