import Link from "next/link";
import {
  ASSET_CATEGORY_LABELS,
  ASSET_STATUS_LABELS,
  type Asset,
  type AssetStatus,
} from "@/lib/inventory/types";
import { cn } from "@/lib/utils";

interface AssetDetailHeaderProps {
  asset: Asset;
}

const STATUS_BADGE_CLASS: Record<AssetStatus, string> = {
  AVAILABLE:
    "border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700",
  ASSIGNED: "border border-sky-500/20 bg-sky-500/[0.08] text-sky-700",
  IN_REPAIR: "border border-amber-500/30 bg-amber-500/[0.08] text-amber-700",
  RETIRED: "border border-[#e0e0e0] bg-[#e0e0e0]/40 text-[#555555]",
};

export function AssetDetailHeader({ asset }: AssetDetailHeaderProps) {
  return (
    <section
      data-testid="asset-detail-header"
      className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
    >
      <Link
        href="/inventory"
        className="text-xs font-semibold uppercase tracking-wide text-[#888888] hover:text-[#c80000]"
      >
        ← Back to inventory
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          {asset.name}
        </h1>
        <span
          data-testid="asset-status-badge"
          data-asset-status={asset.status}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
            STATUS_BADGE_CLASS[asset.status],
          )}
        >
          {ASSET_STATUS_LABELS[asset.status]}
        </span>
      </div>

      <p className="mt-2 text-sm text-[#888888]">
        <span>Tag: {asset.tag}</span>
        <span className="mx-2">·</span>
        <span>Serial: {asset.serial}</span>
        <span className="mx-2">·</span>
        <span>Category: {ASSET_CATEGORY_LABELS[asset.category]}</span>
      </p>
    </section>
  );
}
