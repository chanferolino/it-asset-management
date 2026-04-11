import { notFound } from "next/navigation";
import { findAssetById } from "@/lib/inventory/lookup";
import { MOCK_ASSETS } from "@/lib/inventory/mock-data";
import { getWarrantyStatus } from "@/lib/inventory/warranty";
import { MOCK_VENDORS } from "@/lib/vendors/mock-data";
import { findVendorById } from "@/lib/vendors/lookup";
import { AssetDetailHeader } from "../_components/asset-detail-header";
import { WarrantyBlock } from "../_components/warranty-block";
import { VendorBlock } from "../_components/vendor-block";

// Mock "today" anchor so warranty states align with the mock data seeds.
// Swap for `new Date()` once backed by real data.
const MOCK_TODAY = new Date("2026-04-11T00:00:00.000Z");

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({
  params,
}: AssetDetailPageProps) {
  const { id } = await params;
  const asset = findAssetById(MOCK_ASSETS, id);
  if (!asset) {
    notFound();
  }
  const vendor = findVendorById(MOCK_VENDORS, asset.vendorId ?? "");
  const status = getWarrantyStatus(asset.warrantyExpiresAt, MOCK_TODAY);

  return (
    <div className="space-y-6">
      <AssetDetailHeader asset={asset} />
      <div className="grid gap-6 lg:grid-cols-2">
        <WarrantyBlock asset={asset} status={status} today={MOCK_TODAY} />
        <VendorBlock vendor={vendor} />
      </div>
    </div>
  );
}
