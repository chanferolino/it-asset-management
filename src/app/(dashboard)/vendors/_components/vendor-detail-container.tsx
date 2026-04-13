"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateVendor, deleteVendor } from "@/lib/actions/vendors";
import type { Asset } from "@/lib/inventory/types";
import type { Vendor } from "@/lib/vendors/types";
import {
  VendorFormModal,
  type VendorFormValues,
} from "./vendor-form-modal";
import { VendorDeleteDialog } from "./vendor-delete-dialog";
import { VendorAssetsList } from "./vendor-assets-list";

interface VendorDetailContainerProps {
  initialVendor: Vendor;
  initialAssets: Asset[];
}

export function VendorDetailContainer({
  initialVendor,
  initialAssets,
}: VendorDetailContainerProps) {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor>(initialVendor);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();

  async function handleEdit(values: VendorFormValues) {
    const result = await updateVendor(vendor.id, values);
    if (result.success) {
      setVendor((prev) => ({ ...prev, ...values }));
      setEditOpen(false);
      toast.success("Vendor updated");
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    const result = await deleteVendor(vendor.id);
    if (result.success) {
      toast.success("Vendor deleted");
      router.push("/vendors");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div
      data-testid="vendor-detail-container"
      data-vendor-id={vendor.id}
      className="grid gap-6 lg:grid-cols-[2fr_1fr]"
    >
      <div className="space-y-6">
        <section
          data-testid="vendor-detail-contact"
          className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
        >
          <h2 className="text-base font-bold tracking-tight text-[#300000]">
            Contact
          </h2>

          <dl className="mt-4 space-y-3 text-sm text-[#555555]">
            <div className="flex items-center gap-2">
              <Mail
                aria-hidden="true"
                className="size-4 shrink-0 text-[#888888]"
              />
              <a
                href={`mailto:${vendor.contactEmail}`}
                className="text-[#555555] hover:text-[#c80000]"
                data-testid="vendor-detail-email"
              >
                {vendor.contactEmail}
              </a>
            </div>

            {vendor.contactPhone ? (
              <div className="flex items-center gap-2">
                <Phone
                  aria-hidden="true"
                  className="size-4 shrink-0 text-[#888888]"
                />
                <a
                  href={`tel:${vendor.contactPhone.replace(/\s+/g, "")}`}
                  className="text-[#555555] hover:text-[#c80000]"
                  data-testid="vendor-detail-phone"
                >
                  {vendor.contactPhone}
                </a>
              </div>
            ) : null}

            {vendor.website ? (
              <div className="flex items-center gap-2">
                <Globe
                  aria-hidden="true"
                  className="size-4 shrink-0 text-[#888888]"
                />
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#555555] hover:text-[#c80000]"
                  data-testid="vendor-detail-website"
                >
                  {vendor.website}
                </a>
              </div>
            ) : null}
          </dl>

          {vendor.notes ? (
            <p
              data-testid="vendor-detail-notes"
              className="mt-4 border-t border-[#e0e0e0]/60 pt-4 text-sm text-[#888888]"
            >
              {vendor.notes}
            </p>
          ) : null}
        </section>

        <VendorAssetsList assets={initialAssets} />
      </div>

      <aside
        data-testid="vendor-detail-actions"
        className="h-fit rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
      >
        <h2 className="text-base font-bold tracking-tight text-[#300000]">
          Actions
        </h2>
        <p className="mt-2 text-xs text-[#888888]">
          Manage this vendor record.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="button"
            data-testid="vendor-detail-edit-button"
            onClick={() => setEditOpen(true)}
            className="rounded-xl bg-[#c80000] text-white hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98] transition-all"
          >
            Edit vendor
          </Button>
          <Button
            type="button"
            data-testid="vendor-detail-delete-button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl border border-[#e0e0e0] bg-transparent text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
          >
            Delete vendor
          </Button>
        </div>
      </aside>

      <VendorFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        vendor={vendor}
        onSubmit={handleEdit}
      />

      <VendorDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        vendorName={vendor.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
