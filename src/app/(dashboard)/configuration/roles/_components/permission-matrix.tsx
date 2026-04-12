import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PERMISSION_KEYS,
  hasPermission,
  type PermissionKey,
} from "@/lib/permissions";
import type { Role } from "@/generated/prisma";

const ROLES: readonly Role[] = ["ADMIN", "MANAGER", "USER"] as const;

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  "asset.create": "Create assets",
  "asset.read": "View assets",
  "asset.update": "Update assets",
  "asset.delete": "Delete assets",
  "user.read": "View users",
  "user.manage": "Manage users & roles",
  "ticket.create": "Create tickets",
  "ticket.read": "View tickets",
  "ticket.update": "Update tickets",
  "ticket.delete": "Delete tickets",
  "report.read": "View reports",
  "config.read": "View configuration",
  "config.manage": "Manage configuration",
};

export function PermissionMatrix() {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Permission
            </TableHead>
            {ROLES.map((role) => (
              <TableHead
                key={role}
                className="text-center text-xs font-semibold uppercase tracking-wide text-[#555555]"
              >
                {role}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSION_KEYS.map((key) => (
            <TableRow key={key}>
              <TableCell className="text-[#300000]">
                <span className="font-medium">{PERMISSION_LABELS[key]}</span>
                <span className="ml-2 text-xs text-[#888888]">{key}</span>
              </TableCell>
              {ROLES.map((role) => {
                const allowed = hasPermission(role, key);
                return (
                  <TableCell
                    key={`${role}-${key}`}
                    className="text-center"
                  >
                    {allowed ? (
                      <span
                        aria-label="allowed"
                        className="inline-flex size-6 items-center justify-center rounded-full bg-red-500/[0.08] text-[#c80000]"
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        aria-label="not allowed"
                        className="inline-flex size-6 items-center justify-center rounded-full bg-[#f5f5f5] text-[#bbbbbb]"
                      >
                        ✗
                      </span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
