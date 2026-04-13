import { notFound } from "next/navigation";
import { getAsset } from "@/lib/actions/inventory";
import { getWarrantyStatus } from "@/lib/inventory/warranty";
import type { Vendor } from "@/lib/vendors/types";
import { AssetDetailHeader } from "../_components/asset-detail-header";
import { WarrantyBlock } from "../_components/warranty-block";
import { VendorBlock } from "../_components/vendor-block";

export const dynamic = "force-dynamic";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({
  params,
}: AssetDetailPageProps) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) {
    notFound();
  }

  const today = new Date();
  const status = getWarrantyStatus(asset.warrantyExpiresAt, today);

  const vendor: Vendor | null = asset.vendor
    ? {
        id: asset.vendor.id,
        name: asset.vendor.name,
        contactEmail: asset.vendor.contactEmail,
        contactPhone: asset.vendor.contactPhone ?? undefined,
        website: asset.vendor.website ?? undefined,
        createdAt: "",
      }
    : null;

  return (
    <div className="space-y-6">
      <AssetDetailHeader asset={asset} />
      <div className="grid gap-6 lg:grid-cols-2">
        <WarrantyBlock asset={asset} status={status} today={today} />
        <VendorBlock vendor={vendor} />
      </div>
    </div>
  );
}
