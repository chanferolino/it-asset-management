"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guards";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  assignedToId: z.string().optional(),
  assetId: z.string().optional(),
});

const updateTicketSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assignedToId: z.string().nullable().optional(),
  assetId: z.string().nullable().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

// ---------------------------------------------------------------------------
// Shared select for user relations
// ---------------------------------------------------------------------------

const userSelect = { id: true, name: true } as const;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getTickets(filters?: {
  status?: string;
  priority?: string;
  search?: string;
}) {
  const where: Prisma.TicketWhereInput = {};

  if (filters?.status) {
    where.status = filters.status as Prisma.EnumTicketStatusFilter["equals"];
  }

  if (filters?.priority) {
    where.priority =
      filters.priority as Prisma.EnumTicketPriorityFilter["equals"];
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.ticket.findMany({
    where,
    include: {
      createdBy: { select: userSelect },
      assignedTo: { select: userSelect },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTicket(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: { select: userSelect },
      assignedTo: { select: userSelect },
    },
  });
}

export async function getTicketStats() {
  const groups = await prisma.ticket.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return groups.map((g) => ({
    status: g.status,
    count: g._count.status,
  }));
}

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createTicket(
  input: CreateTicketInput
): Promise<ActionResult> {
  const session = await requirePermission("ticket.create");

  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payload",
    };
  }

  await prisma.ticket.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });

  revalidatePath("/tickets");

  return { success: true };
}

export async function updateTicket(
  id: string,
  input: UpdateTicketInput
): Promise<ActionResult> {
  await requirePermission("ticket.update");

  const parsed = updateTicketSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payload",
    };
  }

  const data: Prisma.TicketUpdateInput = { ...parsed.data };

  // Auto-set resolvedAt based on status transitions
  if (parsed.data.status === "RESOLVED") {
    data.resolvedAt = new Date();
  } else if (parsed.data.status === "NEW") {
    data.resolvedAt = null;
  }

  try {
    await prisma.ticket.update({ where: { id }, data });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Ticket not found." };
    }
    throw error;
  }

  revalidatePath("/tickets");

  return { success: true };
}

export async function deleteTicket(id: string): Promise<ActionResult> {
  await requirePermission("ticket.delete");

  try {
    await prisma.ticket.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Ticket not found." };
    }
    throw error;
  }

  revalidatePath("/tickets");

  return { success: true };
}
