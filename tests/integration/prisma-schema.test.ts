import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { testPrisma } from "../helpers/db";

describe("prisma schema — Configuration module", () => {
  beforeEach(async () => {
    await testPrisma.setting.deleteMany();
  });

  afterAll(async () => {
    await testPrisma.setting.deleteMany();
    await testPrisma.$disconnect();
  });

  it("exposes the MANAGER role on the Role enum", async () => {
    const user = await testPrisma.user.create({
      data: {
        email: `manager-${Date.now()}@test.local`,
        name: "Manager Test",
        hashedPassword: "not-a-real-hash",
        role: "MANAGER",
      },
    });

    expect(user.role).toBe("MANAGER");

    await testPrisma.user.delete({ where: { id: user.id } });
  });

  it("creates a singleton Setting row with default values", async () => {
    const setting = await testPrisma.setting.create({
      data: { id: "singleton" },
    });

    expect(setting.id).toBe("singleton");
    expect(setting.siteName).toBe("IT Asset Management");
    expect(setting.supportEmail).toBe("support@company.com");
    expect(setting.notificationsEnabled).toBe(true);
    expect(setting.smtpHost).toBeNull();
    expect(setting.smtpFromAddress).toBeNull();
  });

  it("is idempotent when upserted twice (seed-safety)", async () => {
    await testPrisma.setting.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });
    await testPrisma.setting.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });

    const rows = await testPrisma.setting.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("singleton");
  });
});
