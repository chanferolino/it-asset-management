import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const setting = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-[#300000]">
          System Settings
        </h2>
        <p className="text-sm text-[#888888]">
          General application settings and outbound email configuration.
        </p>
      </div>
      <SettingsForm
        defaultValues={{
          siteName: setting.siteName,
          supportEmail: setting.supportEmail,
          notificationsEnabled: setting.notificationsEnabled,
          smtpHost: setting.smtpHost ?? "",
          smtpFromAddress: setting.smtpFromAddress ?? "",
          logoDataUrl: setting.logoDataUrl ?? "",
        }}
      />
    </div>
  );
}
