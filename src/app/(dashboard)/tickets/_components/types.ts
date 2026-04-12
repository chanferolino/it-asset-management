export type TicketStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  assignedToId: string | null;
  assetId: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
};

export type SimpleUser = { id: string; name: string };

export const STATUS_LABELS: Record<TicketStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const STATUS_BADGE_CLASSES: Record<TicketStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-700",
  IN_PROGRESS: "bg-amber-500/10 text-amber-700",
  RESOLVED: "bg-green-500/10 text-green-700",
  CLOSED: "bg-gray-500/10 text-gray-500",
};

export const PRIORITY_BADGE_CLASSES: Record<TicketPriority, string> = {
  LOW: "bg-gray-500/10 text-gray-500",
  MEDIUM: "bg-blue-500/10 text-blue-700",
  HIGH: "bg-amber-500/10 text-amber-700",
  CRITICAL: "bg-red-500/10 text-red-700",
};
