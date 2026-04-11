import { describe, expect, it } from "vitest";
import {
  EXPIRING_SOON_DAYS,
  getWarrantyStatus,
} from "@/lib/inventory/warranty";

const TODAY = new Date("2026-04-11T12:00:00.000Z");

describe("getWarrantyStatus", () => {
  it("returns UNDER_WARRANTY for a date 60 days in the future", () => {
    expect(getWarrantyStatus("2026-06-10", TODAY)).toBe("UNDER_WARRANTY");
  });

  it("returns UNDER_WARRANTY for a date exactly 31 days in the future", () => {
    expect(getWarrantyStatus("2026-05-12", TODAY)).toBe("UNDER_WARRANTY");
  });

  it("returns EXPIRING_SOON for a date exactly 30 days in the future (boundary)", () => {
    expect(getWarrantyStatus("2026-05-11", TODAY)).toBe("EXPIRING_SOON");
  });

  it("returns EXPIRING_SOON for a date exactly 1 day in the future", () => {
    expect(getWarrantyStatus("2026-04-12", TODAY)).toBe("EXPIRING_SOON");
  });

  it("returns EXPIRING_SOON for a date equal to today", () => {
    expect(getWarrantyStatus("2026-04-11", TODAY)).toBe("EXPIRING_SOON");
  });

  it("returns EXPIRED for a date 1 day before today", () => {
    expect(getWarrantyStatus("2026-04-10", TODAY)).toBe("EXPIRED");
  });

  it("returns EXPIRED for a date years in the past", () => {
    expect(getWarrantyStatus("2020-01-01", TODAY)).toBe("EXPIRED");
  });

  it("returns NO_WARRANTY when expiresAt is null", () => {
    expect(getWarrantyStatus(null, TODAY)).toBe("NO_WARRANTY");
  });

  it("returns NO_WARRANTY when expiresAt is an empty string", () => {
    expect(getWarrantyStatus("", TODAY)).toBe("NO_WARRANTY");
  });

  it("returns NO_WARRANTY when expiresAt is unparseable", () => {
    expect(getWarrantyStatus("not-a-date", TODAY)).toBe("NO_WARRANTY");
  });

  it("exports EXPIRING_SOON_DAYS = 30 as a named constant", () => {
    expect(EXPIRING_SOON_DAYS).toBe(30);
  });
});
