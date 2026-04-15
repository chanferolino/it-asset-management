"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const preferencesSchema = z.object({
  system: z.boolean(),
  security: z.boolean(),
  maintenance: z.boolean(),
  warranty: z.boolean(),
  inApp: z.boolean(),
  email: z.boolean(),
});

export type NotificationPreferencesValues = z.infer<typeof preferencesSchema>;

const DEFAULTS: NotificationPreferencesValues = {
  system: true,
  security: true,
  maintenance: true,
  warranty: true,
  inApp: true,
  email: false,
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function getNotificationPreferences(): Promise<NotificationPreferencesValues> {
  const userId = await requireUserId();

  const existing = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (existing) {
    return {
      system: existing.system,
      security: existing.security,
      maintenance: existing.maintenance,
      warranty: existing.warranty,
      inApp: existing.inApp,
      email: existing.email,
    };
  }

  return DEFAULTS;
}

export async function updateNotificationPreferences(
  input: NotificationPreferencesValues,
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid preferences." };
  }

  const userId = await requireUserId();

  await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/notifications/preferences");
  return { success: true };
}
