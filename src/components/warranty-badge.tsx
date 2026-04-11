import {
  WARRANTY_STATUS_LABELS,
  type WarrantyStatus,
} from "@/lib/inventory/warranty";
import { cn } from "@/lib/utils";

interface WarrantyBadgeProps {
  status: WarrantyStatus;
  className?: string;
}

const WARRANTY_BADGE_CLASS: Record<WarrantyStatus, string> = {
  UNDER_WARRANTY:
    "border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700",
  EXPIRING_SOON:
    "border border-amber-500/30 bg-amber-500/[0.08] text-amber-700",
  EXPIRED: "border border-red-500/20 bg-red-500/[0.08] text-[#c80000]",
  NO_WARRANTY:
    "border border-[#e0e0e0] bg-[#e0e0e0]/40 text-[#555555]",
};

export function WarrantyBadge({ status, className }: WarrantyBadgeProps) {
  return (
    <span
      data-testid="warranty-badge"
      data-warranty-status={status}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
        WARRANTY_BADGE_CLASS[status],
        className,
      )}
    >
      {WARRANTY_STATUS_LABELS[status]}
    </span>
  );
}
