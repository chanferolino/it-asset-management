import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatRelativeDays,
} from "@/lib/inventory/format";
import { MOCK_ASSETS } from "@/lib/inventory/mock-data";
import { getWarrantyStatus } from "@/lib/inventory/warranty";

const TODAY = new Date("2026-04-11T12:00:00.000Z");

describe("formatCurrency", () => {
  it("formats a positive cent value as USD", () => {
    expect(formatCurrency(149999)).toBe("$1,499.99");
  });

  it("formats zero cents as $0.00", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("returns the em-dash fallback when value is null", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("respects a custom fallback string", () => {
    expect(formatCurrency(null, { fallback: "Unknown" })).toBe("Unknown");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as a long US date", () => {
    expect(formatDate("2026-03-15")).toBe("March 15, 2026");
  });

  it("returns the em-dash fallback when value is null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns the fallback when value is empty", () => {
    expect(formatDate("")).toBe("—");
  });

  it("returns the fallback when value is unparseable", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatRelativeDays", () => {
  it("returns 'today' when the date equals today", () => {
    expect(formatRelativeDays("2026-04-11", TODAY)).toBe("today");
  });

  it("returns 'in N days' for a future date", () => {
    expect(formatRelativeDays("2026-04-21", TODAY)).toBe("in 10 days");
  });

  it("returns 'in 1 day' (singular) for one day ahead", () => {
    expect(formatRelativeDays("2026-04-12", TODAY)).toBe("in 1 day");
  });

  it("returns 'N days ago' for a past date", () => {
    expect(formatRelativeDays("2026-04-01", TODAY)).toBe("10 days ago");
  });

  it("returns '1 day ago' (singular) for one day back", () => {
    expect(formatRelativeDays("2026-04-10", TODAY)).toBe("1 day ago");
  });
});

describe("MOCK_ASSETS seed warranty distribution", () => {
  it("covers every warranty status at least the required minimum (sanity check)", () => {
    const statuses = MOCK_ASSETS.map((a) =>
      getWarrantyStatus(a.warrantyExpiresAt, TODAY),
    );
    const counts = {
      EXPIRED: statuses.filter((s) => s === "EXPIRED").length,
      EXPIRING_SOON: statuses.filter((s) => s === "EXPIRING_SOON").length,
      UNDER_WARRANTY: statuses.filter((s) => s === "UNDER_WARRANTY").length,
      NO_WARRANTY: statuses.filter((s) => s === "NO_WARRANTY").length,
    };
    expect(counts.EXPIRED).toBeGreaterThanOrEqual(2);
    expect(counts.EXPIRING_SOON).toBeGreaterThanOrEqual(3);
    expect(counts.UNDER_WARRANTY).toBeGreaterThanOrEqual(4);
    expect(counts.NO_WARRANTY).toBeGreaterThanOrEqual(1);
  });
});
