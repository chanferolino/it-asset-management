"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MOCK_ASSETS } from "@/lib/inventory/mock-data";
import { MOCK_VENDORS } from "@/lib/vendors/mock-data";
import { countAssetsForVendor } from "@/lib/vendors/lookup";
import type { Vendor } from "@/lib/vendors/types";
import { VendorCard } from "./vendor-card";
import {
  VendorFormModal,
  type VendorFormValues,
} from "./vendor-form-modal";

function generateVendorId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `v_${globalThis.crypto.randomUUID()}`;
  }
  return `v_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

interface VendorsListContainerProps {
  initialVendors?: Vendor[];
}

export function VendorsListContainer({
  initialVendors = MOCK_VENDORS,
}: VendorsListContainerProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [createOpen, setCreateOpen] = useState(false);

  function handleCreate(values: VendorFormValues) {
    const newVendor: Vendor = {
      id: generateVendorId(),
      createdAt: new Date().toISOString(),
      ...values,
    };
    setVendors((prev) => [newVendor, ...prev]);
    setCreateOpen(false);
    toast.success("Vendor added — recorded locally (UI only)");
  }

  return (
    <div
      data-testid="vendors-list-container"
      data-create-open={createOpen}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#888888]">
          {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}
        </p>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          data-testid="vendors-add-button"
          className="rounded-xl bg-[#c80000] text-white hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98] transition-all"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add vendor
        </Button>
      </div>

      {vendors.length === 0 ? (
        <div
          data-testid="vendors-empty-state"
          className="rounded-3xl border border-dashed border-[#e0e0e0] bg-white/40 p-10 text-center backdrop-blur-xl"
        >
          <p className="text-sm text-[#888888]">
            No vendors yet. Add your first vendor to get started.
          </p>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            data-testid="vendors-empty-add-button"
            className="mt-4 rounded-xl bg-[#c80000] text-white hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98] transition-all"
          >
            Add your first vendor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.id}`}
              className="block h-full rounded-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
            >
              <VendorCard
                vendor={vendor}
                assetCount={countAssetsForVendor(MOCK_ASSETS, vendor.id)}
              />
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[#888888]">
        UI-only preview — changes are not saved.
      </p>

      <VendorFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
