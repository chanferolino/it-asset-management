import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/permissions";

describe("hasPermission", () => {
  describe("ADMIN", () => {
    it("allows any permission key via wildcard", () => {
      expect(hasPermission("ADMIN", "asset.create")).toBe(true);
      expect(hasPermission("ADMIN", "user.manage")).toBe(true);
      expect(hasPermission("ADMIN", "config.manage")).toBe(true);
      expect(hasPermission("ADMIN", "unknown.key")).toBe(true);
    });
  });

  describe("MANAGER", () => {
    it("allows all asset keys via dotted-prefix wildcard", () => {
      expect(hasPermission("MANAGER", "asset.create")).toBe(true);
      expect(hasPermission("MANAGER", "asset.read")).toBe(true);
      expect(hasPermission("MANAGER", "asset.update")).toBe(true);
      expect(hasPermission("MANAGER", "asset.delete")).toBe(true);
    });

    it("allows all ticket keys via dotted-prefix wildcard", () => {
      expect(hasPermission("MANAGER", "ticket.create")).toBe(true);
      expect(hasPermission("MANAGER", "ticket.update")).toBe(true);
    });

    it("allows exact-match keys", () => {
      expect(hasPermission("MANAGER", "report.read")).toBe(true);
      expect(hasPermission("MANAGER", "user.read")).toBe(true);
    });

    it("denies keys outside the matrix", () => {
      expect(hasPermission("MANAGER", "config.manage")).toBe(false);
      expect(hasPermission("MANAGER", "user.manage")).toBe(false);
    });
  });

  describe("USER", () => {
    it("allows only exact-match keys", () => {
      expect(hasPermission("USER", "asset.read")).toBe(true);
      expect(hasPermission("USER", "ticket.create")).toBe(true);
      expect(hasPermission("USER", "ticket.read")).toBe(true);
    });

    it("denies asset mutations", () => {
      expect(hasPermission("USER", "asset.create")).toBe(false);
      expect(hasPermission("USER", "asset.update")).toBe(false);
      expect(hasPermission("USER", "asset.delete")).toBe(false);
    });

    it("denies user management", () => {
      expect(hasPermission("USER", "user.manage")).toBe(false);
    });

    it("denies unknown keys", () => {
      expect(hasPermission("USER", "unknown.key")).toBe(false);
    });
  });
});
