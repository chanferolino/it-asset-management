import { Database, ExternalLink, ShieldCheck, CircleAlert } from "lucide-react";

export function BackupInfo() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/[0.08] text-[#c80000]">
            <Database className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#300000]">
              Managed Backups
            </h2>
            <p className="text-sm text-[#888888]">
              Backups are handled by the managed Postgres provider. Snapshots
              and point-in-time restore are available from the Vercel project
              dashboard — no configuration is required in this application.
            </p>
            <a
              href="https://vercel.com/dashboard/stores"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white/60 px-4 py-2 text-sm font-medium text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
            >
              Open Vercel storage dashboard
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#c80000]" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#555555]">
              Covered
            </h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[#300000]">
            <li>• Automated daily snapshots of the Postgres database</li>
            <li>• Point-in-time recovery within the retention window</li>
            <li>• All application tables (Assets, Users, Tickets, Settings)</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <CircleAlert className="size-5 text-[#c80000]" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#555555]">
              Not covered
            </h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[#300000]">
            <li>• Files uploaded to third-party storage</li>
            <li>• Environment variables and secrets</li>
            <li>• Application source code (use Git)</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e0e0e0] bg-white/60 p-4 text-sm text-[#888888] backdrop-blur-sm">
        <span className="font-semibold text-[#555555]">Planned for v1.5:</span>{" "}
        one-click JSON export of domain tables (assets, vendors, assignments)
        directly from this page.
      </div>
    </div>
  );
}
