"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "MANAGER", "USER"]).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: z.enum(["ADMIN", "MANAGER", "USER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// Shared select that excludes hashedPassword
const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  department: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getUsers(search?: string) {
  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { department: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  return prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

export async function getDepartments() {
  const results = await prisma.user.findMany({
    where: { department: { not: null } },
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });

  return results.map((r) => r.department as string);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createUser(
  input: CreateUserInput
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payload",
    };
  }

  const { password, ...rest } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        ...rest,
        hashedPassword,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "A user with this email already exists." };
    }
    throw error;
  }

  revalidatePath("/users");

  return { success: true };
}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payload",
    };
  }

  const { password, ...rest } = parsed.data;

  // Prevent self-demotion
  if (session.user.id === id && rest.role && rest.role !== "ADMIN") {
    return { success: false, error: "You cannot demote yourself." };
  }

  const data: Prisma.UserUpdateInput = { ...rest };

  if (password) {
    data.hashedPassword = await bcrypt.hash(password, 12);
  }

  try {
    await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "A user with this email already exists." };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "User not found." };
    }
    throw error;
  }

  revalidatePath("/users");

  return { success: true };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  if (session.user.id === id) {
    return { success: false, error: "You cannot deactivate yourself." };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "User not found." };
    }
    throw error;
  }

  revalidatePath("/users");

  return { success: true };
}
