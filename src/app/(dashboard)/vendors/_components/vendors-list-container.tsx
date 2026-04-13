"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createVendor } from "@/lib/actions/vendors";
import type { VendorWithCount } from "@/lib/actions/vendors";
import { VendorCard } from "./vendor-card";
import {
  VendorFormModal,
  type VendorFormValues,
} from "./vendor-form-modal";

interface VendorsListContainerProps {
  initialVendors: VendorWithCount[];
}

export function VendorsListContainer({
  initialVendors,
}: VendorsListContainerProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [, startTransition] = useTransition();
  const vendors = initialVendors;

  async function handleCreate(values: VendorFormValues) {
    const result = await createVendor(values);
    if (result.success) {
      setCreateOpen(false);
      toast.success("Vendor created");
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
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
                assetCount={vendor.assetCount}
              />
            </Link>
          ))}
        </div>
      )}

      <VendorFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
