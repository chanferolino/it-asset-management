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
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="border-b border-[#e0e0e0]">
        <Tabs defaultValue="overview" className="flex flex-col">
          <TabsList variant="line" className="mb-0 gap-0 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[#888888] transition-all hover:text-[#7b0000] data-active:border-[#c80000] data-active:text-[#c80000] data-active:bg-transparent data-active:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[#888888] transition-all hover:text-[#7b0000] data-active:border-[#c80000] data-active:text-[#c80000] data-active:bg-transparent data-active:shadow-none"
            >
              Asset Usage
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[#888888] transition-all hover:text-[#7b0000] data-active:border-[#c80000] data-active:text-[#c80000] data-active:bg-transparent data-active:shadow-none"
            >
              Ticket Metrics
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[#888888] transition-all hover:text-[#7b0000] data-active:border-[#c80000] data-active:text-[#c80000] data-active:bg-transparent data-active:shadow-none"
            >
              Audit Log
            </TabsTrigger>
          </TabsList>

          <div className="pt-6">
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
          </div>
        </Tabs>
      </div>
    </div>
  );
}
