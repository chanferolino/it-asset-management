"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./overview-tab";
import { AssetReportTab } from "./asset-report-tab";
import { TicketReportTab } from "./ticket-report-tab";
import { AuditLogTab } from "./audit-log-tab";
import type { AssetReport, TicketReport, OverviewStats, AuditLogEntry } from "./types";

export function ReportsPageClient({
  overviewStats,
  assetReport,
  ticketReport,
  initialAuditLogs,
  initialAuditLogCount,
}: {
  overviewStats: OverviewStats;
  assetReport: AssetReport;
  ticketReport: TicketReport;
  initialAuditLogs: AuditLogEntry[];
  initialAuditLogCount: number;
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line" className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="assets">Asset Usage</TabsTrigger>
        <TabsTrigger value="tickets">Ticket Metrics</TabsTrigger>
        <TabsTrigger value="audit">Audit Log</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab stats={overviewStats} />
      </TabsContent>

      <TabsContent value="assets">
        <AssetReportTab report={assetReport} />
      </TabsContent>

      <TabsContent value="tickets">
        <TicketReportTab report={ticketReport} />
      </TabsContent>

      <TabsContent value="audit">
        <AuditLogTab
          initialLogs={initialAuditLogs}
          initialCount={initialAuditLogCount}
        />
      </TabsContent>
    </Tabs>
  );
}
