import { getAssets } from "@/lib/actions/inventory";
import { getVendors } from "@/lib/actions/vendors";
import { InventoryWarrantyView } from "./_components/inventory-warranty-view";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [assets, vendors] = await Promise.all([getAssets(), getVendors()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Inventory
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Warranty view — full inventory management coming with R2.
        </p>
      </div>
      <InventoryWarrantyView assets={assets} vendors={vendors} />
    </div>
  );
}
