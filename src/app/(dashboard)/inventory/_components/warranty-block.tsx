import { WarrantyBadge } from "@/components/warranty-badge";
import { formatCurrency, formatDate, formatRelativeDays } from "@/lib/inventory/format";
import type { Asset } from "@/lib/inventory/types";
import type { WarrantyStatus } from "@/lib/inventory/warranty";

interface WarrantyBlockProps {
  asset: Asset;
  status: WarrantyStatus;
  today: Date;
}

const RELATIVE_WINDOW_DAYS = 60;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isWithinRelativeWindow(iso: string | null, today: Date): boolean {
  if (!iso) return false;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return false;
  const diff = Math.abs(ms - today.getTime());
  return diff <= RELATIVE_WINDOW_DAYS * MS_PER_DAY;
}

export function WarrantyBlock({ asset, status, today }: WarrantyBlockProps) {
  const showRelative = isWithinRelativeWindow(asset.warrantyExpiresAt, today);
  const relative =
    showRelative && asset.warrantyExpiresAt
      ? formatRelativeDays(asset.warrantyExpiresAt, today)
      : null;

  return (
    <section
      data-testid="warranty-block"
      className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
    >
      <h2 className="text-base font-bold tracking-tight text-[#300000]">
        Warranty &amp; purchase
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Purchase date
          </dt>
          <dd
            data-testid="warranty-block-purchase-date"
            className="mt-1 text-[#300000]"
          >
            {formatDate(asset.purchaseDate)}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Purchase cost
          </dt>
          <dd
            data-testid="warranty-block-purchase-cost"
            className="mt-1 text-[#300000]"
          >
            {formatCurrency(asset.purchaseCost)}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Warranty expires
          </dt>
          <dd
            data-testid="warranty-block-expires"
            className="mt-1 text-[#300000]"
          >
            {formatDate(asset.warrantyExpiresAt)}
            {relative ? (
              <span
                data-testid="warranty-block-relative"
                className="ml-2 text-xs text-[#888888]"
              >
                ({relative})
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-[#e0e0e0]/60 pt-4">
        <WarrantyBadge status={status} />
      </div>
    </section>
  );
}
