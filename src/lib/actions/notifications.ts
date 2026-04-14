"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Notification } from "@/lib/notifications/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function getNotifications(): Promise<Notification[]> {
  const user = await requireUser();
  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    category: r.category,
    severity: r.severity,
    read: r.read,
    createdAt: r.createdAt.toISOString(),
    link: r.link ?? undefined,
  }));
}

export async function getUnreadCount(): Promise<number> {
  const user = await requireUser();
  return prisma.notification.count({
    where: { userId: user.id, read: false },
  });
}

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function markAsRead(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  });
  if (!notification) {
    return { success: false, error: "Notification not found" };
  }
  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllAsRead(): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/notifications");
  return { success: true };
}

export async function dismissNotification(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  });
  if (!notification) {
    return { success: false, error: "Notification not found" };
  }
  await prisma.notification.delete({ where: { id } });
  revalidatePath("/notifications");
  return { success: true };
}
