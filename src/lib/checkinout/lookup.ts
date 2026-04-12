import type { Asset } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function findAssetByTagOrSerial(
  assets: Asset[],
  query: string,
): Asset | null {
  const normalized = normalize(query);
  if (normalized === "") return null;

  const match = assets.find(
    (asset) =>
      normalize(asset.tag) === normalized ||
      normalize(asset.serial) === normalized,
  );

  return match ?? null;
}
