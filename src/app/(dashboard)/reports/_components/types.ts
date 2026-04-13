export type AssetReport = {
  total: number;
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
};

export type TicketReport = {
  total: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  avgResolutionHours: number | null;
};

export type OverviewStats = {
  totalAssets: number;
  totalUsers: number;
  openTickets: number;
  totalVendors: number;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  user: { id: string; name: string } | null;
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  ASSIGN: "Assign",
  UNASSIGN: "Unassign",
  CHECK_IN: "Check In",
  CHECK_OUT: "Check Out",
  LOGIN: "Login",
  STATUS_CHANGE: "Status Change",
};

export const AUDIT_ACTION_BADGE_COLORS: Record<string, string> = {
  CREATE: "border-green-500/20 bg-green-500/10 text-green-700",
  UPDATE: "border-blue-500/20 bg-blue-500/10 text-blue-700",
  DELETE: "border-red-500/20 bg-red-500/10 text-red-700",
  ASSIGN: "border-blue-500/20 bg-blue-500/10 text-blue-700",
  UNASSIGN: "border-gray-500/20 bg-gray-500/10 text-gray-700",
  CHECK_IN: "border-green-500/20 bg-green-500/10 text-green-700",
  CHECK_OUT: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  LOGIN: "border-gray-500/20 bg-gray-500/10 text-gray-700",
  STATUS_CHANGE: "border-purple-500/20 bg-purple-500/10 text-purple-700",
};

export const AUDIT_ENTITY_OPTIONS = [
  "All",
  "Asset",
  "Ticket",
  "User",
  "Vendor",
  "Assignment",
  "Setting",
] as const;

export const AUDIT_ACTION_OPTIONS = [
  "All",
  "CREATE",
  "UPDATE",
  "DELETE",
  "ASSIGN",
  "UNASSIGN",
  "CHECK_IN",
  "CHECK_OUT",
  "LOGIN",
  "STATUS_CHANGE",
] as const;
