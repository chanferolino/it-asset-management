import { getAssets } from "@/lib/actions/inventory";
import { getVendors } from "@/lib/actions/vendors";
import { InventoryPageClient } from "./_components/inventory-page-client";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [assets, vendors] = await Promise.all([getAssets(), getVendors()]);

  return <InventoryPageClient assets={assets} vendors={vendors} />;
}
