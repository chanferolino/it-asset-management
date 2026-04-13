import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, revalidatePathMock, prismaMock } = vi.hoisted(
  () => ({
    requireAdminMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    prismaMock: {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    },
  }),
);

vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: requireAdminMock,
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getUsers,
  getDepartments,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/actions/users";

const ADMIN_SESSION = {
  user: { id: "admin-1", email: "admin@test.com", name: "Admin", role: "ADMIN" },
};

describe("users server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminMock.mockResolvedValue(ADMIN_SESSION);
  });

  // -----------------------------------------------------------------------
  // getUsers
  // -----------------------------------------------------------------------
  describe("getUsers", () => {
    it("calls findMany with correct select and no where clause", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await getUsers();

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {},
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          department: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        }),
        orderBy: { createdAt: "desc" },
      });
      // hashedPassword must NOT be selected
      const call = prismaMock.user.findMany.mock.calls[0][0];
      expect(call.select).not.toHaveProperty("hashedPassword");
    });

    it("passes OR filters when search is provided", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await getUsers("eng");

      const call = prismaMock.user.findMany.mock.calls[0][0];
      expect(call.where).toEqual({
        OR: [
          { name: { contains: "eng", mode: "insensitive" } },
          { email: { contains: "eng", mode: "insensitive" } },
          { department: { contains: "eng", mode: "insensitive" } },
        ],
      });
    });
  });

  // -----------------------------------------------------------------------
  // getDepartments
  // -----------------------------------------------------------------------
  describe("getDepartments", () => {
    it("returns distinct department strings", async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { department: "Engineering" },
        { department: "Marketing" },
      ]);

      const result = await getDepartments();

      expect(result).toEqual(["Engineering", "Marketing"]);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { department: { not: null } },
        select: { department: true },
        distinct: ["department"],
        orderBy: { department: "asc" },
      });
    });
  });

  // -----------------------------------------------------------------------
  // createUser
  // -----------------------------------------------------------------------
  describe("createUser", () => {
    it("validates input, hashes password, and creates user", async () => {
      prismaMock.user.create.mockResolvedValue({});

      const result = await createUser({
        name: "New User",
        email: "new@test.com",
        password: "securepass123",
        role: "USER",
        department: "Engineering",
      });

      expect(result).toEqual({ success: true });
      expect(requireAdminMock).toHaveBeenCalledOnce();
      expect(prismaMock.user.create).toHaveBeenCalledOnce();

      const createData = prismaMock.user.create.mock.calls[0][0].data;
      expect(createData.name).toBe("New User");
      expect(createData.email).toBe("new@test.com");
      expect(createData.role).toBe("USER");
      expect(createData.department).toBe("Engineering");
      // Password should be hashed, not stored as plain text
      expect(createData.hashedPassword).toBeDefined();
      expect(createData.hashedPassword).not.toBe("securepass123");
      // Should not store plain password
      expect(createData).not.toHaveProperty("password");
      expect(revalidatePathMock).toHaveBeenCalledWith("/users");
    });

    it("returns validation error for invalid input", async () => {
      const result = await createUser({
        name: "",
        email: "not-an-email",
        password: "short",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("returns error for duplicate email (P2002)", async () => {
      const prismaError = new Error("Unique constraint") as Error & {
        code: string;
      };
      prismaError.code = "P2002";
      Object.setPrototypeOf(prismaError, Object.getPrototypeOf(prismaError));
      // Simulate PrismaClientKnownRequestError
      (prismaError as unknown as Record<string, unknown>).name =
        "PrismaClientKnownRequestError";

      // We need to match the instanceof check. Import Prisma error class.
      const { Prisma } = await import("@/generated/prisma");
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "5.0.0" },
      );
      prismaMock.user.create.mockRejectedValue(p2002);

      const result = await createUser({
        name: "Dupe User",
        email: "dupe@test.com",
        password: "securepass123",
      });

      expect(result).toEqual({
        success: false,
        error: "A user with this email already exists.",
      });
    });
  });

  // -----------------------------------------------------------------------
  // updateUser
  // -----------------------------------------------------------------------
  describe("updateUser", () => {
    it("updates fields successfully", async () => {
      prismaMock.user.update.mockResolvedValue({});

      const result = await updateUser("u_other", {
        name: "Updated Name",
        role: "MANAGER",
      });

      expect(result).toEqual({ success: true });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "u_other" },
        data: expect.objectContaining({
          name: "Updated Name",
          role: "MANAGER",
        }),
      });
      expect(revalidatePathMock).toHaveBeenCalledWith("/users");
    });

    it("prevents self-demotion", async () => {
      const result = await updateUser("admin-1", {
        role: "USER",
      });

      expect(result).toEqual({
        success: false,
        error: "You cannot demote yourself.",
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("hashes password when provided", async () => {
      prismaMock.user.update.mockResolvedValue({});

      await updateUser("u_other", { password: "newpassword1" });

      const updateData = prismaMock.user.update.mock.calls[0][0].data;
      expect(updateData.hashedPassword).toBeDefined();
      expect(updateData.hashedPassword).not.toBe("newpassword1");
    });
  });

  // -----------------------------------------------------------------------
  // deleteUser
  // -----------------------------------------------------------------------
  describe("deleteUser", () => {
    it("sets status to INACTIVE", async () => {
      prismaMock.user.update.mockResolvedValue({});

      const result = await deleteUser("u_other");

      expect(result).toEqual({ success: true });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "u_other" },
        data: { status: "INACTIVE" },
      });
      expect(revalidatePathMock).toHaveBeenCalledWith("/users");
    });

    it("prevents self-deactivation", async () => {
      const result = await deleteUser("admin-1");

      expect(result).toEqual({
        success: false,
        error: "You cannot deactivate yourself.",
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("returns error when user not found (P2025)", async () => {
      const { Prisma } = await import("@/generated/prisma");
      const p2025 = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      prismaMock.user.update.mockRejectedValue(p2025);

      const result = await deleteUser("nonexistent");

      expect(result).toEqual({
        success: false,
        error: "User not found.",
      });
    });
  });
});
