import Link from "next/link";
import { WarrantyBadge } from "@/components/warranty-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/inventory/format";
import type { Asset } from "@/lib/inventory/types";
import type { WarrantyStatus } from "@/lib/inventory/warranty";
import { findVendorById } from "@/lib/vendors/lookup";
import { MOCK_VENDORS } from "@/lib/vendors/mock-data";

export interface WarrantyTableRow {
  asset: Asset;
  status: WarrantyStatus;
}

interface WarrantyTableProps {
  assets: WarrantyTableRow[];
}

export function WarrantyTable({ assets }: WarrantyTableProps) {
  return (
    <section
      data-testid="warranty-table"
      className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
    >
      {assets.length === 0 ? (
        <p
          data-testid="warranty-table-empty"
          className="text-sm text-[#888888]"
        >
          No assets match the current filter.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Tag
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Warranty expires
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                Vendor
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(({ asset, status }) => {
              const vendor = findVendorById(MOCK_VENDORS, asset.vendorId ?? "");
              return (
                <TableRow
                  key={asset.id}
                  data-testid="warranty-table-row"
                  data-asset-id={asset.id}
                  data-warranty-status={status}
                >
                  <TableCell>
                    <Link
                      href={`/inventory/${asset.id}`}
                      className="text-[#7b0000] hover:text-[#c80000]"
                    >
                      {asset.tag}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#555555]">{asset.name}</TableCell>
                  <TableCell className="text-[#555555]">
                    {formatDate(asset.warrantyExpiresAt)}
                  </TableCell>
                  <TableCell>
                    <WarrantyBadge status={status} />
                  </TableCell>
                  <TableCell>
                    {vendor ? (
                      <Link
                        href={`/vendors/${vendor.id}`}
                        className="text-[#7b0000] hover:text-[#c80000]"
                      >
                        {vendor.name}
                      </Link>
                    ) : (
                      <span className="text-[#888888]">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
