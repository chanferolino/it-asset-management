"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WarrantyAlertBannerProps {
  expiredCount: number;
  expiringCount: number;
  dismissed: boolean;
  onDismiss: () => void;
  onViewExpired: () => void;
  onViewExpiring: () => void;
}

function formatExpiredCopy(expiredCount: number, expiringCount: number): string {
  const expiredWord = expiredCount === 1 ? "warranty" : "warranties";
  return `${expiredCount} ${expiredWord} expired, ${expiringCount} expiring within 30 days`;
}

export function WarrantyAlertBanner({
  expiredCount,
  expiringCount,
  dismissed,
  onDismiss,
  onViewExpired,
  onViewExpiring,
}: WarrantyAlertBannerProps) {
  if (dismissed) return null;
  if (expiredCount === 0 && expiringCount === 0) return null;

  return (
    <div
      data-testid="warranty-alert-banner"
      data-expired-count={expiredCount}
      data-expiring-count={expiringCount}
      className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p
        data-testid="warranty-alert-copy"
        className="text-sm font-medium text-[#c80000]"
      >
        {formatExpiredCopy(expiredCount, expiringCount)}
      </p>

      <div className="flex items-center gap-2">
        {expiredCount > 0 ? (
          <Button
            type="button"
            data-testid="warranty-alert-view-expired"
            onClick={onViewExpired}
            className="rounded-xl border border-[#e0e0e0] bg-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            View expired
          </Button>
        ) : null}
        {expiringCount > 0 ? (
          <Button
            type="button"
            data-testid="warranty-alert-view-expiring"
            onClick={onViewExpiring}
            className="rounded-xl border border-[#e0e0e0] bg-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            View expiring
          </Button>
        ) : null}
        <button
          type="button"
          aria-label="Dismiss warranty alert"
          data-testid="warranty-alert-dismiss"
          onClick={onDismiss}
          className="rounded-full p-1.5 text-[#7b0000] transition-all hover:bg-red-500/[0.08]"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
