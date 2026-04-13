export type DashboardStats = {
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  totalUsers: number;
  totalVendors: number;
  unreadNotifications: number;
};

export type RecentActivity = {
  id: string;
  type: "CHECK_OUT" | "CHECK_IN";
  assetName: string;
  assetTag: string;
  userName: string;
  timestamp: string;
};

export type StatusCount = { status: string; count: number };
export type CategoryCount = { category: string; count: number };
