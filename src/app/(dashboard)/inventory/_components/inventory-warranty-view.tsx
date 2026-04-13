"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/lib/inventory/types";
import { getWarrantyStatus, type WarrantyStatus } from "@/lib/inventory/warranty";
import type { VendorWithCount } from "@/lib/actions/vendors";
import { cn } from "@/lib/utils";
import { WarrantyAlertBanner } from "./warranty-alert-banner";
import { WarrantyTable, type WarrantyTableRow } from "./warranty-table";

type WarrantyFilter =
  | "ALL"
  | "EXPIRED"
  | "EXPIRING_SOON"
  | "UNDER_WARRANTY"
  | "NO_WARRANTY";

const FILTER_OPTIONS: Array<{ value: WarrantyFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "EXPIRED", label: "Expired" },
  { value: "EXPIRING_SOON", label: "Expiring soon" },
  { value: "UNDER_WARRANTY", label: "Under warranty" },
  { value: "NO_WARRANTY", label: "No warranty" },
];

interface InventoryWarrantyViewProps {
  assets?: Asset[];
  vendors?: VendorWithCount[];
  // Test-only affordance: lets tests pin warranty status to a known date.
  todayOverride?: Date;
  assetsOverride?: Asset[];
}

export function InventoryWarrantyView({
  assets,
  vendors,
  todayOverride,
  assetsOverride,
}: InventoryWarrantyViewProps = {}) {
  const [filter, setFilter] = useState<WarrantyFilter>("ALL");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { rows, expiredCount, expiringCount } = useMemo(() => {
    const today = todayOverride ?? new Date();
    const source = assetsOverride ?? assets ?? [];
    const withStatus: WarrantyTableRow[] = source.map((asset) => ({
      asset,
      status: getWarrantyStatus(asset.warrantyExpiresAt, today),
    }));
    return {
      rows: withStatus,
      expiredCount: withStatus.filter((r) => r.status === "EXPIRED").length,
      expiringCount: withStatus.filter((r) => r.status === "EXPIRING_SOON")
        .length,
    };
  }, [todayOverride, assetsOverride, assets]);

  const filteredRows =
    filter === "ALL"
      ? rows
      : rows.filter((r) => r.status === (filter as WarrantyStatus));

  return (
    <div data-testid="inventory-warranty-view" className="space-y-6">
      <WarrantyAlertBanner
        expiredCount={expiredCount}
        expiringCount={expiringCount}
        dismissed={bannerDismissed}
        onDismiss={() => setBannerDismissed(true)}
        onViewExpired={() => setFilter("EXPIRED")}
        onViewExpiring={() => setFilter("EXPIRING_SOON")}
      />

      <div
        data-testid="warranty-filter-row"
        data-active-filter={filter}
        className="flex flex-wrap gap-2"
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          return (
            <Button
              key={opt.value}
              type="button"
              data-testid={`warranty-filter-${opt.value.toLowerCase()}`}
              data-active={isActive}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all",
                isActive
                  ? "border-[#c80000] bg-red-500/[0.08] text-[#c80000]"
                  : "border-[#e0e0e0] bg-transparent text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04]",
              )}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>

      <WarrantyTable assets={filteredRows} vendors={vendors} />

      <div className="flex justify-end">
        <Link
          href="/vendors"
          data-testid="inventory-manage-vendors-link"
          className="rounded-xl border border-[#e0e0e0] bg-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
        >
          Manage vendors →
        </Link>
      </div>
    </div>
  );
}
