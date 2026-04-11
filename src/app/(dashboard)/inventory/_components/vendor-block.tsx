import Link from "next/link";
import { Globe, Mail, Phone } from "lucide-react";
import type { Vendor } from "@/lib/vendors/types";

interface VendorBlockProps {
  vendor: Vendor | null;
}

export function VendorBlock({ vendor }: VendorBlockProps) {
  return (
    <section
      data-testid="vendor-block"
      className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
    >
      <h2 className="text-base font-bold tracking-tight text-[#300000]">
        Vendor
      </h2>

      {vendor === null ? (
        <p
          data-testid="vendor-block-empty"
          className="mt-4 text-sm text-[#888888]"
        >
          Vendor no longer available
        </p>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-[#555555]">
          <Link
            href={`/vendors/${vendor.id}`}
            data-testid="vendor-block-link"
            className="inline-block text-base font-bold tracking-tight text-[#7b0000] hover:text-[#c80000]"
          >
            {vendor.name}
          </Link>

          <div className="flex items-center gap-2">
            <Mail
              aria-hidden="true"
              className="size-4 shrink-0 text-[#888888]"
            />
            <a
              href={`mailto:${vendor.contactEmail}`}
              className="text-[#555555] hover:text-[#c80000]"
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
                className="text-[#555555] hover:text-[#c80000]"
              >
                {vendor.website}
              </a>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
