import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@/generated/prisma";

interface AuditEntry {
  action: AuditAction;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  userId?: string;
}

export function createAuditEntry({
  action,
  entity,
  entityId,
  details,
  userId,
}: AuditEntry): void {
  // Fire-and-forget — never block the primary action
  prisma.auditLog
    .create({
      data: {
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        userId: userId ?? null,
      },
    })
    .catch((error) => {
      console.error("Failed to create audit log entry:", error);
    });
}
