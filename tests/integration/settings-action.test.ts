import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, revalidatePathMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: requireAdminMock,
  requirePermission: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { updateSettings } from "@/lib/actions/settings";
import { testPrisma } from "../helpers/db";

async function seedSingleton() {
  await testPrisma.setting.upsert({
    where: { id: "singleton" },
    update: {
      siteName: "IT Asset Management",
      supportEmail: "support@company.com",
      notificationsEnabled: true,
      smtpHost: null,
      smtpFromAddress: null,
    },
    create: { id: "singleton" },
  });
}

describe("updateSettings server action", () => {
  beforeEach(async () => {
    requireAdminMock.mockReset();
    revalidatePathMock.mockReset();
    requireAdminMock.mockResolvedValue({
      user: { id: "a1", email: "a@x.com", name: "A", role: "ADMIN" },
    });
    await testPrisma.setting.deleteMany();
    await seedSingleton();
  });

  afterAll(async () => {
    await testPrisma.setting.deleteMany();
    await testPrisma.$disconnect();
  });

  it("persists valid settings and revalidates the settings path", async () => {
    const result = await updateSettings({
      siteName: "Acme Assets",
      supportEmail: "help@acme.test",
      notificationsEnabled: false,
      smtpHost: "smtp.acme.test",
      smtpFromAddress: "noreply@acme.test",
    });

    expect(result).toEqual({ success: true });
    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/configuration/settings"
    );

    const row = await testPrisma.setting.findUnique({
      where: { id: "singleton" },
    });
    expect(row).toMatchObject({
      siteName: "Acme Assets",
      supportEmail: "help@acme.test",
      notificationsEnabled: false,
      smtpHost: "smtp.acme.test",
      smtpFromAddress: "noreply@acme.test",
    });
  });

  it("stores empty optional SMTP fields as null", async () => {
    const result = await updateSettings({
      siteName: "Acme",
      supportEmail: "help@acme.test",
      notificationsEnabled: true,
      smtpHost: "",
      smtpFromAddress: "",
    });

    expect(result).toEqual({ success: true });

    const row = await testPrisma.setting.findUnique({
      where: { id: "singleton" },
    });
    expect(row?.smtpHost).toBeNull();
    expect(row?.smtpFromAddress).toBeNull();
  });

  it("rejects an invalid support email without touching the database", async () => {
    const result = await updateSettings({
      siteName: "Acme",
      supportEmail: "not-an-email",
      notificationsEnabled: true,
      smtpHost: "",
      smtpFromAddress: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/valid email/i);
    }
    expect(revalidatePathMock).not.toHaveBeenCalled();

    const row = await testPrisma.setting.findUnique({
      where: { id: "singleton" },
    });
    expect(row?.supportEmail).toBe("support@company.com");
  });

  it("rejects an empty site name", async () => {
    const result = await updateSettings({
      siteName: "   ",
      supportEmail: "help@acme.test",
      notificationsEnabled: true,
      smtpHost: "",
      smtpFromAddress: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/site name/i);
    }
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("propagates the redirect thrown by requireAdmin for non-admins", async () => {
    requireAdminMock.mockImplementationOnce(() => {
      const error = new Error("NEXT_REDIRECT:/");
      (error as Error & { digest: string }).digest = "NEXT_REDIRECT;/";
      throw error;
    });

    await expect(
      updateSettings({
        siteName: "Acme",
        supportEmail: "help@acme.test",
        notificationsEnabled: true,
        smtpHost: "",
        smtpFromAddress: "",
      })
    ).rejects.toThrow(/NEXT_REDIRECT:\//);

    const row = await testPrisma.setting.findUnique({
      where: { id: "singleton" },
    });
    expect(row?.siteName).toBe("IT Asset Management");
  });
});
