import { describe, expect, it } from "vitest";
import { findAssetByTagOrSerial } from "@/lib/checkinout/lookup";
import type { Asset } from "@/lib/checkinout/types";

const ASSETS: Asset[] = [
  {
    id: "a_001",
    tag: "IT-0001",
    serial: "SN-ABCD1234",
    name: 'MacBook Pro 14"',
    category: "LAPTOP",
    status: "AVAILABLE",
  },
  {
    id: "a_002",
    tag: "IT-0002",
    serial: "SN-EFGH5678",
    name: "Dell XPS 13",
    category: "LAPTOP",
    status: "ASSIGNED",
    currentAssigneeId: "u_001",
  },
];

describe("findAssetByTagOrSerial", () => {
  it("finds an asset by its exact tag", () => {
    const result = findAssetByTagOrSerial(ASSETS, "IT-0001");
    expect(result?.id).toBe("a_001");
  });

  it("finds an asset by its exact serial", () => {
    const result = findAssetByTagOrSerial(ASSETS, "SN-EFGH5678");
    expect(result?.id).toBe("a_002");
  });

  it("trims leading and trailing whitespace before matching", () => {
    const result = findAssetByTagOrSerial(ASSETS, "   IT-0001   ");
    expect(result?.id).toBe("a_001");
  });

  it("matches tags case-insensitively", () => {
    const result = findAssetByTagOrSerial(ASSETS, "it-0001");
    expect(result?.id).toBe("a_001");
  });

  it("matches serials case-insensitively", () => {
    const result = findAssetByTagOrSerial(ASSETS, "sn-efgh5678");
    expect(result?.id).toBe("a_002");
  });

  it("returns null when no asset matches", () => {
    const result = findAssetByTagOrSerial(ASSETS, "NOT-A-REAL-TAG");
    expect(result).toBeNull();
  });

  it("returns null for an empty string query", () => {
    const result = findAssetByTagOrSerial(ASSETS, "");
    expect(result).toBeNull();
  });

  it("returns null for a whitespace-only query", () => {
    const result = findAssetByTagOrSerial(ASSETS, "    ");
    expect(result).toBeNull();
  });

  it("returns the first match in array order when both tag and serial could collide", () => {
    const collisionAssets: Asset[] = [
      { ...ASSETS[0], id: "first" },
      {
        ...ASSETS[1],
        id: "second",
        serial: ASSETS[0].tag,
      },
    ];
    const result = findAssetByTagOrSerial(collisionAssets, ASSETS[0].tag);
    expect(result?.id).toBe("first");
  });
});
