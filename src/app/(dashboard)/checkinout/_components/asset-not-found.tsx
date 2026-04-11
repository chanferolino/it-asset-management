"use client";

import { Button } from "@/components/ui/button";

interface AssetNotFoundProps {
  query: string;
  onClear: () => void;
}

export function AssetNotFound({ query, onClear }: AssetNotFoundProps) {
  return (
    <div
      data-testid="asset-not-found"
      className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-[#c80000]"
    >
      <p className="font-medium">
        No asset matches &ldquo;{query}&rdquo;.
      </p>
      <p className="mt-1 text-sm text-[#7b0000]">
        Double-check the tag or serial, or confirm the asset has been added to
        Inventory.
      </p>
      <div className="mt-3">
        <Button
          data-testid="asset-not-found-clear"
          onClick={onClear}
          className="rounded-xl border border-[#e0e0e0] bg-transparent px-4 py-1.5 text-sm text-[#7b0000] transition-all hover:border-[#c80000] hover:bg-red-500/[0.04]"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
