import { Globe, Mail, Package, Phone } from "lucide-react";
import type { Vendor } from "@/lib/vendors/types";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  vendor: Vendor;
  assetCount: number;
  className?: string;
}

export function VendorCard({ vendor, assetCount, className }: VendorCardProps) {
  return (
    <article
      data-testid="vendor-card"
      data-vendor-id={vendor.id}
      className={cn(
        "flex h-full cursor-pointer flex-col gap-4 rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl transition-all duration-200 hover:border-red-500/30",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-[#300000]">
          {vendor.name}
        </h2>
        {vendor.notes ? (
          <p className="line-clamp-2 text-xs text-[#888888]">{vendor.notes}</p>
        ) : null}
      </div>

      <div className="space-y-2 text-sm text-[#555555]">
        <div className="flex items-center gap-2">
          <Mail
            aria-hidden="true"
            className="size-4 shrink-0 text-[#888888]"
          />
          <a
            href={`mailto:${vendor.contactEmail}`}
            className="truncate text-[#555555] hover:text-[#c80000]"
            onClick={(e) => e.stopPropagation()}
          >
            {vendor.contactEmail}
          </a>
        </div>

        {vendor.contactPhone ? (
          <div className="flex items-center gap-2">
            <Phone
              aria-hidden="true"
              className="size-4 shrink-0 text-[#888888]"
            />
            <a
              href={`tel:${vendor.contactPhone.replace(/\s+/g, "")}`}
              className="text-[#555555] hover:text-[#c80000]"
              onClick={(e) => e.stopPropagation()}
            >
              {vendor.contactPhone}
            </a>
          </div>
        ) : null}

        {vendor.website ? (
          <div className="flex items-center gap-2">
            <Globe
              aria-hidden="true"
              className="size-4 shrink-0 text-[#888888]"
            />
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-[#555555] hover:text-[#c80000]"
              onClick={(e) => e.stopPropagation()}
            >
              {vendor.website}
            </a>
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-[#e0e0e0]/60 pt-3 text-xs text-[#888888]">
        <Package aria-hidden="true" className="size-4" />
        <span data-testid="vendor-card-asset-count">
          {assetCount} {assetCount === 1 ? "asset" : "assets"}
        </span>
      </div>
    </article>
  );
}
