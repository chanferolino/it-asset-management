import { requireAdmin } from "@/lib/auth-guards";
import { ConfigTabs } from "./_components/config-tabs";

export default async function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Configuration
        </h1>
        <p className="text-[#888888]">
          System settings, roles, permissions, integrations, and backups.
        </p>
      </div>

      <div className="rounded-2xl border border-white/80 bg-white/70 p-1 backdrop-blur-xl">
        <ConfigTabs />
      </div>

      <div>{children}</div>
    </div>
  );
}
