import { VendorsListContainer } from "./_components/vendors-list-container";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Vendors
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Manage vendor records, contact info, and warranty providers.
        </p>
      </div>
      <VendorsListContainer />
    </div>
  );
}
