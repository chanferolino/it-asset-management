import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("password123", 12);

  // ── Users ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Admin",
      hashedPassword,
      role: "ADMIN",
      department: "IT",
    },
  });
  console.log("Seeded admin user:", admin.email);

  const userSeeds = [
    { email: "sara.patel@example.com", name: "Sara Patel", department: "Engineering" },
    { email: "marco.reyes@example.com", name: "Marco Reyes", department: "Design" },
    { email: "jordan.kim@example.com", name: "Jordan Kim", department: "Operations" },
    { email: "priya.shah@example.com", name: "Priya Shah", department: "Finance" },
    { email: "alex.nguyen@example.com", name: "Alex Nguyen", department: "Support" },
  ];

  const users: Record<string, string> = { [admin.email]: admin.id };
  for (const u of userSeeds) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, hashedPassword: userPassword, role: "USER" },
    });
    users[user.email] = user.id;
  }
  console.log(`Seeded ${userSeeds.length} users`);

  // ── Assets ──────────────────────────────────────────────
  const assetSeeds = [
    { tag: "IT-0001", serial: "SN-WXYZ9876", name: 'MacBook Pro 14"', category: "LAPTOP" as const, status: "ASSIGNED" as const, currentAssigneeId: users["sara.patel@example.com"], purchaseDate: new Date("2025-09-04"), purchaseCost: 229900, warrantyExpiresAt: new Date("2028-09-04") },
    { tag: "IT-0002", serial: "SN-ABCD1122", name: "Dell XPS 13", category: "LAPTOP" as const, status: "AVAILABLE" as const, purchaseDate: new Date("2024-04-20"), purchaseCost: 149999, warrantyExpiresAt: new Date("2026-04-20") },
    { tag: "IT-0003", serial: "SN-EFGH3344", name: "Lenovo ThinkPad X1", category: "LAPTOP" as const, status: "ASSIGNED" as const, currentAssigneeId: users["marco.reyes@example.com"], purchaseDate: new Date("2025-11-12"), purchaseCost: 189900, warrantyExpiresAt: new Date("2028-11-12") },
    { tag: "IT-0004", serial: "SN-IJKL5566", name: 'LG UltraFine 27"', category: "MONITOR" as const, status: "AVAILABLE" as const, purchaseDate: new Date("2023-04-05"), purchaseCost: 69900 },
    { tag: "IT-0005", serial: "SN-MNOP7788", name: 'Dell UltraSharp 32"', category: "MONITOR" as const, status: "ASSIGNED" as const, currentAssigneeId: users["jordan.kim@example.com"], purchaseDate: new Date("2025-06-18"), purchaseCost: 89900 },
    { tag: "IT-0006", serial: "SN-QRST9900", name: "iPhone 15 Pro", category: "PHONE" as const, status: "ASSIGNED" as const, currentAssigneeId: users["priya.shah@example.com"], purchaseDate: new Date("2025-04-30"), purchaseCost: 119900 },
    { tag: "IT-0007", serial: "SN-UVWX1122", name: "Dell OptiPlex 7090", category: "DESKTOP" as const, status: "RETIRED" as const, purchaseDate: new Date("2023-02-14"), purchaseCost: 124900 },
    { tag: "IT-0008", serial: "SN-YZAB3344", name: "Logitech MX Master 3S", category: "ACCESSORY" as const, status: "AVAILABLE" as const, purchaseDate: new Date("2026-01-10"), purchaseCost: 9999 },
    { tag: "IT-0009", serial: "SN-CDEF5566", name: "HP EliteDesk 800", category: "DESKTOP" as const, status: "ASSIGNED" as const, currentAssigneeId: users["alex.nguyen@example.com"], purchaseDate: new Date("2025-07-22"), purchaseCost: 159900 },
    { tag: "IT-0010", serial: "SN-GHIJ7788", name: "Samsung Galaxy S24", category: "PHONE" as const, status: "ASSIGNED" as const, currentAssigneeId: users["admin@company.com"], purchaseDate: new Date("2024-04-15"), purchaseCost: 99900 },
  ];

  const assets: Record<string, string> = {};
  for (const a of assetSeeds) {
    const asset = await prisma.asset.upsert({
      where: { tag: a.tag },
      update: {},
      create: a,
    });
    assets[asset.tag] = asset.id;
  }
  console.log(`Seeded ${assetSeeds.length} assets`);

  // ── Check Events (assignment history) ───────────────────
  const checkEventSeeds = [
    { assetId: assets["IT-0001"], type: "CHECK_OUT" as const, userId: users["sara.patel@example.com"], timestamp: new Date("2026-03-28T14:05:00Z"), notes: "Onboarding — new hire in Engineering." },
    { assetId: assets["IT-0003"], type: "CHECK_OUT" as const, userId: users["marco.reyes@example.com"], timestamp: new Date("2026-03-15T09:30:00Z") },
    { assetId: assets["IT-0005"], type: "CHECK_OUT" as const, userId: users["jordan.kim@example.com"], timestamp: new Date("2026-02-11T11:20:00Z") },
    { assetId: assets["IT-0006"], type: "CHECK_OUT" as const, userId: users["priya.shah@example.com"], timestamp: new Date("2026-01-22T13:00:00Z"), notes: "Loaner for remote work." },
    { assetId: assets["IT-0009"], type: "CHECK_OUT" as const, userId: users["alex.nguyen@example.com"], timestamp: new Date("2026-03-27T15:00:00Z") },
    { assetId: assets["IT-0010"], type: "CHECK_OUT" as const, userId: users["admin@company.com"], timestamp: new Date("2026-04-01T10:00:00Z") },
    { assetId: assets["IT-0002"], type: "CHECK_OUT" as const, userId: users["jordan.kim@example.com"], timestamp: new Date("2026-02-01T09:00:00Z") },
    { assetId: assets["IT-0002"], type: "CHECK_IN" as const, userId: users["jordan.kim@example.com"], timestamp: new Date("2026-04-02T16:45:00Z"), notes: "Returned after project handoff." },
    { assetId: assets["IT-0004"], type: "CHECK_OUT" as const, userId: users["priya.shah@example.com"], timestamp: new Date("2026-01-22T13:00:00Z") },
    { assetId: assets["IT-0004"], type: "CHECK_IN" as const, userId: users["priya.shah@example.com"], timestamp: new Date("2026-04-05T10:15:00Z") },
  ];

  for (const e of checkEventSeeds) {
    await prisma.checkEvent.create({ data: e });
  }
  console.log(`Seeded ${checkEventSeeds.length} check events`);

  // ── Settings ────────────────────────────────────────────
  const settings = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  console.log("Seeded settings singleton:", settings.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
