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

export type CheckEventType = "CHECK_OUT" | "CHECK_IN";

export interface Asset {
  id: string;
  tag: string;
  serial: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  currentAssigneeId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
}

export interface CheckEvent {
  id: string;
  assetId: string;
  type: CheckEventType;
  userId: string;
  timestamp: string;
  notes?: string;
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

export const CHECK_EVENT_TYPES: CheckEventType[] = ["CHECK_OUT", "CHECK_IN"];

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
