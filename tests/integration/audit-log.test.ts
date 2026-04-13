import { describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => {
  const auditLogCreate = vi.fn().mockReturnValue({
    catch: vi.fn(),
  });

  return {
    prismaMock: {
      auditLog: {
        create: auditLogCreate,
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { createAuditEntry } from "@/lib/audit";

describe("createAuditEntry", () => {
  it("creates a record with correct fields", () => {
    createAuditEntry({
      action: "CREATE",
      entity: "Asset",
      entityId: "asset_123",
      userId: "user_1",
    });

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "CREATE",
        entity: "Asset",
        entityId: "asset_123",
        details: null,
        userId: "user_1",
      },
    });
  });

  it("stringifies details object", () => {
    const details = { field: "status", from: "ACTIVE", to: "RETIRED" };

    createAuditEntry({
      action: "UPDATE",
      entity: "Asset",
      entityId: "asset_456",
      details,
      userId: "user_2",
    });

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "UPDATE",
        entity: "Asset",
        entityId: "asset_456",
        details: JSON.stringify(details),
        userId: "user_2",
      },
    });
  });

  it("silently catches errors (does not throw)", () => {
    const error = new Error("DB connection failed");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    prismaMock.auditLog.create.mockReturnValueOnce({
      catch: (handler: (err: Error) => void) => {
        handler(error);
      },
    });

    expect(() =>
      createAuditEntry({
        action: "DELETE",
        entity: "Asset",
        entityId: "asset_789",
      }),
    ).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to create audit log entry:",
      error,
    );

    consoleSpy.mockRestore();
  });

  it("sets userId to null when not provided", () => {
    createAuditEntry({
      action: "LOGIN",
      entity: "User",
      entityId: "user_999",
    });

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "LOGIN",
        entity: "User",
        entityId: "user_999",
        details: null,
        userId: null,
      },
    });
  });
});
