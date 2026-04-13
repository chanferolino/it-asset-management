"use client";

import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteAsset } from "@/lib/actions/inventory";
import type { InventoryAsset, AssetCategory, AssetStatus } from "./types";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  CATEGORY_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
} from "./types";
import { AssetFormModal } from "./asset-form-modal";

interface AssetDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: InventoryAsset;
  vendors: { id: string; name: string }[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(cents: number | null): string {
  if (cents == null) return "\u2014";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function AssetDetailModal({
  open,
  onOpenChange,
  asset,
  vendors,
}: AssetDetailModalProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleConfirmDelete() {
    const result = await deleteAsset(asset.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Asset deleted");
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight text-[#300000]">
              {asset.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full border-0 text-xs font-medium",
                  CATEGORY_BADGE_CLASSES[asset.category as AssetCategory]
                )}
              >
                {CATEGORY_LABELS[asset.category as AssetCategory] ??
                  asset.category}
              </Badge>
              <Badge
                className={cn(
                  "rounded-full border-0 text-xs font-medium",
                  STATUS_BADGE_CLASSES[asset.status as AssetStatus]
                )}
              >
                {STATUS_LABELS[asset.status as AssetStatus] ?? asset.status}
              </Badge>
            </div>

            {/* Identification */}
            <section className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Identification
              </h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Asset Tag</dt>
                  <dd className="font-medium text-[#300000]">{asset.tag}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Serial Number</dt>
                  <dd className="text-[#555555]">{asset.serial}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Vendor</dt>
                  <dd className="text-[#555555]">
                    {asset.vendor?.name ?? (
                      <span className="text-[#bbbbbb]">None</span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Purchase & Warranty */}
            <section className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Purchase & Warranty
              </h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Purchase Date</dt>
                  <dd className="text-[#555555]">
                    {formatDate(asset.purchaseDate)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Purchase Cost</dt>
                  <dd className="text-[#555555]">
                    {formatCurrency(asset.purchaseCost)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Warranty Expires</dt>
                  <dd className="text-[#555555]">
                    {formatDate(asset.warrantyExpiresAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#888888]">Created</dt>
                  <dd className="text-[#555555]">
                    {formatDate(asset.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-[#e0e0e0]/60 pt-4">
              <Button
                type="button"
                onClick={() => setEditOpen(true)}
                className="cursor-pointer rounded-xl bg-[#c80000] text-white transition-all hover:bg-[#b10000] active:scale-[0.98] active:bg-[#7b0000]"
              >
                Edit
              </Button>
              <Button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="cursor-pointer rounded-xl border border-[#e0e0e0] bg-transparent text-red-600 transition-all hover:border-red-500 hover:bg-red-500/[0.04]"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AssetFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        asset={asset}
        vendors={vendors}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete asset"
        description={`Are you sure you want to delete "${asset.name}" (${asset.tag})? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
