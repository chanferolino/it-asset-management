"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

const updateRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  newRole: z.enum(["ADMIN", "MANAGER", "USER"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateRoleSchema>;

export type UpdateUserRoleResult =
  | { success: true }
  | { success: false; error: string };

export async function updateUserRole(
  input: UpdateUserRoleInput
): Promise<UpdateUserRoleResult> {
  const session = await requireAdmin();

  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payload",
    };
  }

  const { userId, newRole } = parsed.data;

  if (session.user.id === userId && newRole !== "ADMIN") {
    return { success: false, error: "You cannot demote yourself." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
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

  revalidatePath("/configuration/roles");

  return { success: true };
}
