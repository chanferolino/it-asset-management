import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_ASSETS } from "@/lib/inventory/mock-data";
import { MOCK_VENDORS } from "@/lib/vendors/mock-data";
import { findVendorById } from "@/lib/vendors/lookup";
import { VendorDetailContainer } from "../_components/vendor-detail-container";

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({
  params,
}: VendorDetailPageProps) {
  const { id } = await params;
  const vendor = findVendorById(MOCK_VENDORS, id);
  if (!vendor) {
    notFound();
  }
  const assetsForVendor = MOCK_ASSETS.filter((a) => a.vendorId === vendor.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/vendors"
          className="text-xs font-semibold uppercase tracking-wide text-[#888888] hover:text-[#c80000]"
        >
          ← Back to vendors
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#300000]">
          {vendor.name}
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Vendor details and assets supplied.
        </p>
      </div>
      <VendorDetailContainer
        initialVendor={vendor}
        initialAssets={assetsForVendor}
      />
    </div>
  );
}
