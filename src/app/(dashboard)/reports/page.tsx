import {
  getOverviewStats,
  getAssetReport,
  getTicketReport,
  getAuditLogs,
  getAuditLogCount,
} from "@/lib/actions/reports";
import { ReportsPageClient } from "./_components/reports-page-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [overviewResult, assetResult, ticketResult, auditResult, auditCountResult] =
    await Promise.all([
      getOverviewStats(),
      getAssetReport(),
      getTicketReport(),
      getAuditLogs({ take: 50, skip: 0 }),
      getAuditLogCount(),
    ]);

  if (!overviewResult.success) throw new Error(overviewResult.error);
  if (!assetResult.success) throw new Error(assetResult.error);
  if (!ticketResult.success) throw new Error(ticketResult.error);
  if (!auditResult.success) throw new Error(auditResult.error);
  if (!auditCountResult.success) throw new Error(auditCountResult.error);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Reports
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Asset usage reports, audit logs, and analytics.
        </p>
      </div>
      <ReportsPageClient
        overviewStats={{
          totalAssets: overviewResult.data.totalAssets,
          totalUsers: overviewResult.data.totalUsers,
          openTickets: overviewResult.data.totalOpenTickets,
          totalVendors: overviewResult.data.totalVendors,
        }}
        assetReport={assetResult.data}
        ticketReport={{
          total: ticketResult.data.total,
          byStatus: ticketResult.data.byStatus,
          byPriority: ticketResult.data.byPriority,
          avgResolutionHours: ticketResult.data.avgResolutionTimeHours,
        }}
        initialAuditLogs={auditResult.data}
        initialAuditLogCount={auditCountResult.count}
      />
    </div>
  );
}
