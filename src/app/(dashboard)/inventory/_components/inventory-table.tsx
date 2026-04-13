"use client";

import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryAsset, AssetCategory, AssetStatus } from "./types";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  CATEGORY_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
} from "./types";

interface InventoryTableProps {
  assets: InventoryAsset[];
  onDetail: (asset: InventoryAsset) => void;
  onEdit: (asset: InventoryAsset) => void;
  onDelete: (asset: InventoryAsset) => void;
}

const TH_CLASS =
  "text-xs font-semibold uppercase tracking-wide text-[#555555]";

export function InventoryTable({
  assets,
  onDetail,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#e0e0e0] bg-white/40 p-10 text-center backdrop-blur-xl">
        <p className="text-sm text-[#888888]">No assets found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={TH_CLASS}>Asset Tag</TableHead>
            <TableHead className={TH_CLASS}>Name</TableHead>
            <TableHead className={TH_CLASS}>Category</TableHead>
            <TableHead className={TH_CLASS}>Status</TableHead>
            <TableHead className={TH_CLASS}>Vendor</TableHead>
            <TableHead className={cn(TH_CLASS, "text-right")}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>
                <button
                  type="button"
                  onClick={() => onDetail(asset)}
                  className="cursor-pointer font-medium text-[#7b0000] transition-all hover:text-[#c80000]"
                >
                  {asset.tag}
                </button>
              </TableCell>
              <TableCell className="text-[#300000]">{asset.name}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "border-transparent text-xs font-medium",
                    CATEGORY_BADGE_CLASSES[asset.category as AssetCategory]
                  )}
                >
                  {CATEGORY_LABELS[asset.category as AssetCategory] ??
                    asset.category}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "border-transparent text-xs font-medium",
                    STATUS_BADGE_CLASSES[asset.status as AssetStatus]
                  )}
                >
                  {STATUS_LABELS[asset.status as AssetStatus] ?? asset.status}
                </Badge>
              </TableCell>
              <TableCell className="text-[#888888]">
                {asset.vendor?.name ?? "\u2014"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onEdit(asset)}
                    className="cursor-pointer text-[#888888] transition-all hover:text-[#300000]"
                  >
                    <Pencil aria-hidden="true" />
                    <span className="sr-only">Edit {asset.name}</span>
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onDelete(asset)}
                    className="cursor-pointer text-[#888888] transition-all hover:text-[#c80000]"
                  >
                    <Trash2 aria-hidden="true" />
                    <span className="sr-only">Delete {asset.name}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
