import { describe, expect, it } from "vitest";
import { countAssetsForVendor, findVendorById } from "@/lib/vendors/lookup";
import { MOCK_VENDORS } from "@/lib/vendors/mock-data";
import type { Asset } from "@/lib/inventory/types";

const ASSETS: Asset[] = [
  {
    id: "a1",
    tag: "T1",
    serial: "S1",
    name: "One",
    category: "LAPTOP",
    status: "AVAILABLE",
    purchaseDate: null,
    purchaseCost: null,
    warrantyExpiresAt: null,
    vendorId: "v_001",
  },
  {
    id: "a2",
    tag: "T2",
    serial: "S2",
    name: "Two",
    category: "LAPTOP",
    status: "AVAILABLE",
    purchaseDate: null,
    purchaseCost: null,
    warrantyExpiresAt: null,
    vendorId: "v_001",
  },
  {
    id: "a3",
    tag: "T3",
    serial: "S3",
    name: "Three",
    category: "MONITOR",
    status: "AVAILABLE",
    purchaseDate: null,
    purchaseCost: null,
    warrantyExpiresAt: null,
    vendorId: "v_002",
  },
  {
    id: "a4",
    tag: "T4",
    serial: "S4",
    name: "Four",
    category: "ACCESSORY",
    status: "AVAILABLE",
    purchaseDate: null,
    purchaseCost: null,
    warrantyExpiresAt: null,
    vendorId: null,
  },
];

describe("findVendorById", () => {
  it("returns the matching vendor", () => {
    const vendor = findVendorById(MOCK_VENDORS, "v_001");
    expect(vendor?.name).toBe("Acme Supply Co.");
  });

  it("returns null for an unknown id", () => {
    expect(findVendorById(MOCK_VENDORS, "nope")).toBeNull();
  });

  it("returns null for an empty id", () => {
    expect(findVendorById(MOCK_VENDORS, "")).toBeNull();
  });
});

describe("countAssetsForVendor", () => {
  it("returns the correct count when a vendor supplies multiple assets", () => {
    expect(countAssetsForVendor(ASSETS, "v_001")).toBe(2);
  });

  it("returns 1 for a vendor with a single supplied asset", () => {
    expect(countAssetsForVendor(ASSETS, "v_002")).toBe(1);
  });

  it("returns 0 for a vendor with no linked assets", () => {
    expect(countAssetsForVendor(ASSETS, "v_999")).toBe(0);
  });

  it("returns 0 for an empty vendorId", () => {
    expect(countAssetsForVendor(ASSETS, "")).toBe(0);
  });
});
