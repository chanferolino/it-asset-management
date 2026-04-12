"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  Prisma,
  type NotificationCategory as PrismaNotificationCategory,
  type NotificationSeverity as PrismaNotificationSeverity,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Notification } from "@/lib/notifications/types";

// ─── Schemas ────────────────────────────────────────────

const getNotificationsSchema = z.object({
  category: z.enum(["SYSTEM", "SECURITY", "MAINTENANCE", "WARRANTY"]).optional(),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]).optional(),
  userId: z.string().optional(),
});

const markAsReadSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
});

const markAllAsReadSchema = z.object({
  userId: z.string().optional(),
});

const createNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  category: z.enum(["SYSTEM", "SECURITY", "MAINTENANCE", "WARRANTY"]),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  link: z.string().optional(),
  userId: z.string().optional(),
});

// ─── Result types ───────────────────────────────────────

type NotificationsResult =
  | { success: true; notifications: Notification[] }
  | { success: false; error: string };

type UnreadCountResult =
  | { success: true; count: number }
  | { success: false; error: string };

type MutationResult =
  | { success: true }
  | { success: false; error: string };

type CreateNotificationResult =
  | { success: true; id: string }
  | { success: false; error: string };

// ─── Helpers ────────────────────────────────────────────

function serializeNotification(row: {
  id: string;
  title: string;
  body: string;
  category: string;
  severity: string;
  read: boolean;
  createdAt: Date;
  link: string | null;
}): Notification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category as Notification["category"],
    severity: row.severity as Notification["severity"],
    read: row.read,
    createdAt: row.createdAt.toISOString(),
    link: row.link ?? undefined,
  };
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

// ─── Actions ────────────────────────────────────────────

export async function getNotifications(
  filters?: z.infer<typeof getNotificationsSchema>
): Promise<NotificationsResult> {
  await requireAuth();

  const parsed = getNotificationsSchema.safeParse(filters ?? {});
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid filters" };
  }

  const where: Record<string, unknown> = {};
  if (parsed.data.category) {
    where.category = parsed.data.category;
  }
  if (parsed.data.severity) {
    where.severity = parsed.data.severity;
  }
  if (parsed.data.userId) {
    where.userId = parsed.data.userId;
  }

  const rows = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    notifications: rows.map(serializeNotification),
  };
}

export async function getUnreadCount(userId?: string): Promise<UnreadCountResult> {
  await requireAuth();

  const where: Record<string, unknown> = { read: false };
  if (userId) {
    where.userId = userId;
  }

  const count = await prisma.notification.count({ where });

  return { success: true, count };
}

export async function markAsRead(id: string): Promise<MutationResult> {
  await requireAuth();

  const parsed = markAsReadSchema.safeParse({ id });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid ID" };
  }

  try {
    await prisma.notification.update({
      where: { id: parsed.data.id },
      data: { read: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, error: "Notification not found" };
    }
    throw error;
  }

  revalidatePath("/notifications");

  return { success: true };
}

export async function markAllAsRead(userId?: string): Promise<MutationResult> {
  await requireAuth();

  const parsed = markAllAsReadSchema.safeParse({ userId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const where: Record<string, unknown> = { read: false };
  if (parsed.data.userId) {
    where.userId = parsed.data.userId;
  }

  await prisma.notification.updateMany({
    where,
    data: { read: true },
  });

  revalidatePath("/notifications");

  return { success: true };
}

export async function createNotification(
  data: z.infer<typeof createNotificationSchema>
): Promise<CreateNotificationResult> {
  await requireAuth();

  const parsed = createNotificationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const row = await prisma.notification.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category as PrismaNotificationCategory,
      severity: parsed.data.severity as PrismaNotificationSeverity,
      link: parsed.data.link || null,
      userId: parsed.data.userId || null,
    },
  });

  revalidatePath("/notifications");

  return { success: true, id: row.id };
}
