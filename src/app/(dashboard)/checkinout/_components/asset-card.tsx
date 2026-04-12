"use client";

import type { Asset, User } from "@/lib/checkinout/types";
import {
  ASSET_CATEGORY_LABELS,
  ASSET_STATUS_LABELS,
} from "@/lib/checkinout/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: Asset;
  assignee: User | null;
  onCheckoutClick: () => void;
  onCheckinClick: () => void;
}

const STATUS_BADGE_CLASS: Record<Asset["status"], string> = {
  AVAILABLE:
    "border border-[#e0e0e0] bg-white/60 text-[#555555] backdrop-blur-sm",
  ASSIGNED:
    "border border-red-500/20 bg-red-500/[0.08] text-[#c80000]",
  IN_REPAIR:
    "border border-amber-500/30 bg-amber-500/[0.08] text-amber-700",
  RETIRED: "border border-[#e0e0e0] bg-[#e0e0e0]/40 text-[#888888]",
};

export function AssetCard({
  asset,
  assignee,
  onCheckoutClick,
  onCheckinClick,
}: AssetCardProps) {
  const isAvailable = asset.status === "AVAILABLE";
  const isAssigned = asset.status === "ASSIGNED";
  const isRetired = asset.status === "RETIRED";
  const isInRepair = asset.status === "IN_REPAIR";

  return (
    <div
      data-testid="asset-card"
      data-status={asset.status}
      className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-[#300000]">
              {asset.name}
            </h2>
            <Badge
              data-testid="asset-status-badge"
              className={cn("uppercase", STATUS_BADGE_CLASS[asset.status])}
            >
              {ASSET_STATUS_LABELS[asset.status]}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold uppercase tracking-wide text-[#555555]">
            <span>
              Tag:{" "}
              <span className="font-mono normal-case text-[#300000]">
                {asset.tag}
              </span>
            </span>
            <span>
              Serial:{" "}
              <span className="font-mono normal-case text-[#300000]">
                {asset.serial}
              </span>
            </span>
            <span>
              Category:{" "}
              <span className="normal-case text-[#300000]">
                {ASSET_CATEGORY_LABELS[asset.category]}
              </span>
            </span>
          </div>
          {isAssigned ? (
            <p className="text-sm text-[#888888]">
              {assignee
                ? `Assigned to: ${assignee.name}${
                    assignee.department ? ` (${assignee.department})` : ""
                  }`
                : "Assigned (user unknown)"}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          {isAvailable ? (
            <Button
              data-testid="asset-card-checkout-button"
              onClick={onCheckoutClick}
              className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
            >
              Check out
            </Button>
          ) : null}
          {isAssigned ? (
            <Button
              data-testid="asset-card-checkin-button"
              onClick={onCheckinClick}
              className="rounded-xl bg-[#c80000] px-5 py-2 text-white transition-all hover:bg-[#b10000] active:bg-[#7b0000]"
            >
              Check in
            </Button>
          ) : null}
          {isRetired ? (
            <p
              data-testid="asset-card-disabled-note"
              className="text-sm italic text-[#888888]"
            >
              Retired — actions disabled.
            </p>
          ) : null}
          {isInRepair ? (
            <p
              data-testid="asset-card-disabled-note"
              className="text-sm italic text-[#888888]"
            >
              In repair — actions disabled.
            </p>
          ) : null}
          {/* TODO: deep-link to Inventory (R2) once that module exists. */}
          <span className="text-xs text-[#bbbbbb]">
            View in inventory (coming soon)
          </span>
        </div>
      </div>
    </div>
  );
}
