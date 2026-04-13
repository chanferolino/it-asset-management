import Link from "next/link";
import { notFound } from "next/navigation";
import { getVendor } from "@/lib/actions/vendors";
import { VendorDetailContainer } from "../_components/vendor-detail-container";

export const dynamic = "force-dynamic";

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({
  params,
}: VendorDetailPageProps) {
  const { id } = await params;
  const result = await getVendor(id);
  if (!result) {
    notFound();
  }

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
          {result.vendor.name}
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Vendor details and assets supplied.
        </p>
      </div>
      <VendorDetailContainer
        initialVendor={result.vendor}
        initialAssets={result.assets}
      />
    </div>
  );
}
