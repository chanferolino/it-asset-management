import { beforeEach, describe, expect, it, vi } from "vitest";

const { requirePermissionMock, revalidatePathMock, ticketMock, userMock } =
  vi.hoisted(() => ({
    requirePermissionMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    ticketMock: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    userMock: {
      findMany: vi.fn(),
    },
  }));

vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
  requirePermission: requirePermissionMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: ticketMock,
    user: userMock,
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

import {
  getTickets,
  getTicketStats,
  createTicket,
  updateTicket,
  deleteTicket,
} from "@/lib/actions/tickets";

const adminSession = {
  user: { id: "admin-1", email: "admin@test.com", name: "Admin", role: "ADMIN" },
};

describe("tickets server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermissionMock.mockResolvedValue(adminSession);
    ticketMock.findMany.mockResolvedValue([]);
    ticketMock.create.mockResolvedValue({ id: "t1" });
    ticketMock.update.mockResolvedValue({ id: "t1" });
    ticketMock.delete.mockResolvedValue({ id: "t1" });
    ticketMock.groupBy.mockResolvedValue([]);
  });

  // -------------------------------------------------------------------------
  // getTickets
  // -------------------------------------------------------------------------

  describe("getTickets", () => {
    it("calls findMany with correct include and orderBy", async () => {
      await getTickets();

      expect(ticketMock.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          createdBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("passes status filter in where clause", async () => {
      await getTickets({ status: "NEW" });

      expect(ticketMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "NEW" },
        }),
      );
    });

    it("passes OR filter on title/description for search", async () => {
      await getTickets({ search: "laptop" });

      expect(ticketMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: "laptop", mode: "insensitive" } },
              { description: { contains: "laptop", mode: "insensitive" } },
            ],
          },
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // createTicket
  // -------------------------------------------------------------------------

  describe("createTicket", () => {
    it("validates required fields and sets createdById from session", async () => {
      const result = await createTicket({
        title: "Broken monitor",
        description: "Screen flickering on Dell U2723QE",
        priority: "HIGH",
      });

      expect(result).toEqual({ success: true });
      expect(requirePermissionMock).toHaveBeenCalledWith("ticket.create");
      expect(ticketMock.create).toHaveBeenCalledWith({
        data: {
          title: "Broken monitor",
          description: "Screen flickering on Dell U2723QE",
          priority: "HIGH",
          createdById: "admin-1",
        },
      });
      expect(revalidatePathMock).toHaveBeenCalledWith("/tickets");
    });

    it("returns validation error when title is missing", async () => {
      const result = await createTicket({
        title: "",
        description: "Some description",
        priority: "MEDIUM",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/title/i);
      }
      expect(ticketMock.create).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // updateTicket
  // -------------------------------------------------------------------------

  describe("updateTicket", () => {
    it("calls prisma.ticket.update with correct data", async () => {
      const result = await updateTicket("t1", { title: "Updated title" });

      expect(result).toEqual({ success: true });
      expect(requirePermissionMock).toHaveBeenCalledWith("ticket.update");
      expect(ticketMock.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: { title: "Updated title" },
      });
      expect(revalidatePathMock).toHaveBeenCalledWith("/tickets");
    });

    it("auto-sets resolvedAt when status is RESOLVED", async () => {
      const result = await updateTicket("t1", { status: "RESOLVED" });

      expect(result).toEqual({ success: true });
      const callData = ticketMock.update.mock.calls[0][0].data;
      expect(callData.status).toBe("RESOLVED");
      expect(callData.resolvedAt).toBeInstanceOf(Date);
    });

    it("clears resolvedAt to null when status is NEW (reopen)", async () => {
      const result = await updateTicket("t1", { status: "NEW" });

      expect(result).toEqual({ success: true });
      const callData = ticketMock.update.mock.calls[0][0].data;
      expect(callData.status).toBe("NEW");
      expect(callData.resolvedAt).toBeNull();
    });

    it("returns error on nonexistent ticket (P2025)", async () => {
      const prismaError = new Error("Record not found");
      Object.assign(prismaError, { code: "P2025", name: "PrismaClientKnownRequestError" });
      // Need the constructor name to match the instanceof check
      const { Prisma } = await import("@/generated/prisma");
      const knownError = new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "0.0.0",
      });
      ticketMock.update.mockRejectedValueOnce(knownError);

      const result = await updateTicket("nonexistent", { title: "x" });

      expect(result).toEqual({ success: false, error: "Ticket not found." });
    });
  });

  // -------------------------------------------------------------------------
  // deleteTicket
  // -------------------------------------------------------------------------

  describe("deleteTicket", () => {
    it("calls prisma.ticket.delete", async () => {
      const result = await deleteTicket("t1");

      expect(result).toEqual({ success: true });
      expect(requirePermissionMock).toHaveBeenCalledWith("ticket.delete");
      expect(ticketMock.delete).toHaveBeenCalledWith({ where: { id: "t1" } });
      expect(revalidatePathMock).toHaveBeenCalledWith("/tickets");
    });

    it("returns error on nonexistent ticket (P2025)", async () => {
      const { Prisma } = await import("@/generated/prisma");
      const knownError = new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "0.0.0",
      });
      ticketMock.delete.mockRejectedValueOnce(knownError);

      const result = await deleteTicket("nonexistent");

      expect(result).toEqual({ success: false, error: "Ticket not found." });
    });
  });

  // -------------------------------------------------------------------------
  // getTicketStats
  // -------------------------------------------------------------------------

  describe("getTicketStats", () => {
    it("calls groupBy on status and maps results", async () => {
      ticketMock.groupBy.mockResolvedValueOnce([
        { status: "NEW", _count: { status: 5 } },
        { status: "RESOLVED", _count: { status: 3 } },
      ]);

      const stats = await getTicketStats();

      expect(ticketMock.groupBy).toHaveBeenCalledWith({
        by: ["status"],
        _count: { status: true },
      });
      expect(stats).toEqual([
        { status: "NEW", count: 5 },
        { status: "RESOLVED", count: 3 },
      ]);
    });
  });
});
