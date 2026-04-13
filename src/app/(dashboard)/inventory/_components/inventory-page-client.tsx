"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { deleteAsset } from "@/lib/actions/inventory";
import type { VendorWithCount } from "@/lib/actions/vendors";
import { InventoryTable } from "./inventory-table";
import { InventoryWarrantyView } from "./inventory-warranty-view";
import { AssetFormModal } from "./asset-form-modal";
import { AssetDetailModal } from "./asset-detail-modal";
import type { InventoryAsset, AssetCategory } from "./types";

type ViewTab = "assets" | "warranty";

const CATEGORY_FILTERS: { value: AssetCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "LAPTOP", label: "Laptop" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "MONITOR", label: "Monitor" },
  { value: "PHONE", label: "Phone" },
  { value: "ACCESSORY", label: "Accessory" },
];

interface InventoryPageClientProps {
  assets: InventoryAsset[];
  vendors: VendorWithCount[];
}

export function InventoryPageClient({
  assets,
  vendors,
}: InventoryPageClientProps) {
  const [view, setView] = useState<ViewTab>("assets");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    AssetCategory | "ALL"
  >("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<InventoryAsset | undefined>();
  const [detailAsset, setDetailAsset] = useState<InventoryAsset | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<
    InventoryAsset | undefined
  >();

  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ id: v.id, name: v.name })),
    [vendors]
  );

  const filtered = useMemo(() => {
    let result = assets;

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tag.toLowerCase().includes(q) ||
          a.serial.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "ALL") {
      result = result.filter((a) => a.category === categoryFilter);
    }

    return result;
  }, [assets, search, categoryFilter]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const result = await deleteAsset(deleteTarget.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`Deleted ${deleteTarget.name}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Inventory
        </h1>
        <p className="mt-1 text-[#888888]">
          Manage hardware assets, track warranties, and monitor inventory.
        </p>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setView("assets")}
          className={cn(
            "cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all",
            view === "assets"
              ? "border-[#c80000] bg-red-500/[0.08] text-[#c80000]"
              : "border-[#e0e0e0] bg-transparent text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04]"
          )}
        >
          All Assets
        </Button>
        <Button
          type="button"
          onClick={() => setView("warranty")}
          className={cn(
            "cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all",
            view === "warranty"
              ? "border-[#c80000] bg-red-500/[0.08] text-[#c80000]"
              : "border-[#e0e0e0] bg-transparent text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04]"
          )}
        >
          Warranty View
        </Button>
      </div>

      {view === "assets" ? (
        <>
          {/* Search + Add */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#bbbbbb]"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, tag, or serial..."
                className="rounded-xl border border-[#e0e0e0] bg-white/60 pl-9 text-[#300000] placeholder:text-[#bbbbbb] backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
              />
            </div>
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer rounded-xl bg-[#c80000] text-white transition-all hover:bg-[#b10000] active:scale-[0.98] active:bg-[#7b0000]"
            >
              Add Asset <Plus aria-hidden="true" />
            </Button>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((opt) => {
              const isActive = categoryFilter === opt.value;
              return (
                <Button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategoryFilter(opt.value)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all",
                    isActive
                      ? "border-[#c80000] bg-red-500/[0.08] text-[#c80000]"
                      : "border-[#e0e0e0] bg-transparent text-[#7b0000] hover:border-[#c80000] hover:bg-red-500/[0.04]"
                  )}
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>

          {/* Table */}
          <InventoryTable
            assets={filtered}
            onDetail={setDetailAsset}
            onEdit={setEditAsset}
            onDelete={setDeleteTarget}
          />
        </>
      ) : (
        <InventoryWarrantyView assets={assets} vendors={vendors} />
      )}

      {/* Create modal */}
      <AssetFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        vendors={vendorOptions}
      />

      {/* Edit modal */}
      <AssetFormModal
        open={editAsset !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditAsset(undefined);
        }}
        asset={editAsset}
        vendors={vendorOptions}
      />

      {/* Detail modal */}
      {detailAsset && (
        <AssetDetailModal
          open={detailAsset !== undefined}
          onOpenChange={(open) => {
            if (!open) setDetailAsset(undefined);
          }}
          asset={detailAsset}
          vendors={vendorOptions}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(undefined);
        }}
        title="Delete asset"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}" (${deleteTarget.tag})? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
