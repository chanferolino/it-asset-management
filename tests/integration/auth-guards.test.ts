import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT:${url}`);
    (error as Error & { digest: string }).digest = `NEXT_REDIRECT;${url}`;
    throw error;
  }),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import { requireAdmin, requirePermission } from "@/lib/auth-guards";

describe("auth guards", () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockClear();
  });

  describe("requireAdmin", () => {
    it("returns the session for an ADMIN user", async () => {
      authMock.mockResolvedValue({
        user: { id: "a1", email: "a@x.com", name: "A", role: "ADMIN" },
      });

      const session = await requireAdmin();

      expect(session.user.role).toBe("ADMIN");
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it("redirects to /login when no session is present", async () => {
      authMock.mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow(/NEXT_REDIRECT:\/login/);
      expect(redirectMock).toHaveBeenCalledWith("/login");
    });

    it("redirects to / when the session role is USER", async () => {
      authMock.mockResolvedValue({
        user: { id: "u1", email: "u@x.com", name: "U", role: "USER" },
      });

      await expect(requireAdmin()).rejects.toThrow(/NEXT_REDIRECT:\//);
      expect(redirectMock).toHaveBeenCalledWith("/");
    });

    it("redirects to / when the session role is MANAGER", async () => {
      authMock.mockResolvedValue({
        user: { id: "m1", email: "m@x.com", name: "M", role: "MANAGER" },
      });

      await expect(requireAdmin()).rejects.toThrow(/NEXT_REDIRECT:\//);
      expect(redirectMock).toHaveBeenCalledWith("/");
    });
  });

  describe("requirePermission", () => {
    it("returns the session when the role has the permission", async () => {
      authMock.mockResolvedValue({
        user: { id: "m1", email: "m@x.com", name: "M", role: "MANAGER" },
      });

      const session = await requirePermission("asset.update");

      expect(session.user.role).toBe("MANAGER");
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it("redirects to / when the role lacks the permission", async () => {
      authMock.mockResolvedValue({
        user: { id: "u1", email: "u@x.com", name: "U", role: "USER" },
      });

      await expect(requirePermission("asset.create")).rejects.toThrow(
        /NEXT_REDIRECT:\//
      );
      expect(redirectMock).toHaveBeenCalledWith("/");
    });

    it("redirects to /login when no session is present", async () => {
      authMock.mockResolvedValue(null);

      await expect(requirePermission("asset.read")).rejects.toThrow(
        /NEXT_REDIRECT:\/login/
      );
      expect(redirectMock).toHaveBeenCalledWith("/login");
    });
  });
});
