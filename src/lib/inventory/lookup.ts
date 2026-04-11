import type { Asset } from "./types";

export function findAssetById(assets: Asset[], id: string): Asset | null {
  if (!id) return null;
  return assets.find((a) => a.id === id) ?? null;
}
