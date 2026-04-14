"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const preferencesSchema = z.object({
  system: z.boolean(),
  security: z.boolean(),
  maintenance: z.boolean(),
  warranty: z.boolean(),
  inApp: z.boolean(),
  email: z.boolean(),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function getNotificationPreferences(): Promise<PreferencesInput> {
  const user = await requireUser();
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: user.id },
  });
  if (!prefs) {
    return {
      system: true,
      security: true,
      maintenance: true,
      warranty: true,
      inApp: true,
      email: false,
    };
  }
  return {
    system: prefs.system,
    security: prefs.security,
    maintenance: prefs.maintenance,
    warranty: prefs.warranty,
    inApp: prefs.inApp,
    email: prefs.email,
  };
}

export type SavePreferencesResult =
  | { success: true }
  | { success: false; error: string };

export async function saveNotificationPreferences(
  input: PreferencesInput
): Promise<SavePreferencesResult> {
  const user = await requireUser();
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid preferences",
    };
  }
  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/notifications/preferences");
  return { success: true };
}
