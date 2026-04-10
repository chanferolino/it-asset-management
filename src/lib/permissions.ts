import type { Role } from "@/generated/prisma";

export const PERMISSION_KEYS = [
  "asset.create",
  "asset.read",
  "asset.update",
  "asset.delete",
  "user.read",
  "user.manage",
  "ticket.create",
  "ticket.read",
  "ticket.update",
  "ticket.delete",
  "report.read",
  "config.read",
  "config.manage",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const ROLE_MATRIX: Record<Role, readonly string[]> = {
  ADMIN: ["*"],
  MANAGER: ["asset.*", "ticket.*", "report.read", "user.read"],
  USER: ["asset.read", "ticket.create", "ticket.read"],
};

export function hasPermission(role: Role, key: PermissionKey | string): boolean {
  const entries = ROLE_MATRIX[role];
  if (!entries) return false;

  for (const entry of entries) {
    if (entry === "*") return true;
    if (entry === key) return true;
    if (entry.endsWith(".*")) {
      const prefix = entry.slice(0, -1);
      if (key.startsWith(prefix)) return true;
    }
  }

  return false;
}
