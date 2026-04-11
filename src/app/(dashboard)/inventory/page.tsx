import { InventoryWarrantyView } from "./_components/inventory-warranty-view";

export default function InventoryPage() {
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
      <InventoryWarrantyView />
    </div>
  );
}
