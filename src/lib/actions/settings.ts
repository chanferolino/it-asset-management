"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { settingsSchema, type SettingsInput } from "@/lib/validators/settings";

export type UpdateSettingsResult =
  | { success: true }
  | { success: false; error: string };

export async function updateSettings(
  input: SettingsInput
): Promise<UpdateSettingsResult> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid settings payload",
    };
  }

  const data = parsed.data;

  await prisma.setting.update({
    where: { id: "singleton" },
    data: {
      siteName: data.siteName,
      supportEmail: data.supportEmail,
      notificationsEnabled: data.notificationsEnabled,
      smtpHost: data.smtpHost ? data.smtpHost : null,
      smtpFromAddress: data.smtpFromAddress ? data.smtpFromAddress : null,
    },
  });

  revalidatePath("/configuration/settings");

  return { success: true };
}
