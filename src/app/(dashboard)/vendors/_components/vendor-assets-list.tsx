import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ASSET_CATEGORY_LABELS, type Asset } from "@/lib/inventory/types";

interface VendorAssetsListProps {
  assets: Asset[];
}

export function VendorAssetsList({ assets }: VendorAssetsListProps) {
  return (
    <section
      data-testid="vendor-assets-list"
      className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl"
    >
      <h2 className="text-base font-bold tracking-tight text-[#300000]">
        Assets supplied
      </h2>

      {assets.length === 0 ? (
        <p
          data-testid="vendor-assets-empty"
          className="mt-4 text-sm text-[#888888]"
        >
          No assets supplied by this vendor yet.
        </p>
      ) : (
        <div className="mt-4">
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
                  Category
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  data-testid="vendor-assets-row"
                  data-asset-id={asset.id}
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
                    {ASSET_CATEGORY_LABELS[asset.category]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
