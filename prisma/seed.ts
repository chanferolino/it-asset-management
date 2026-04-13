import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("password123", 12);

  // ── Admin ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Admin",
      hashedPassword,
      role: "ADMIN",
      department: "IT",
      phone: "+1 555-0100",
    },
  });
  console.log("Seeded admin user:", admin.email);

  // ── Users (from Users feature #5) ──────────────────────
  const dummyUsers = [
    { email: "maria.santos@company.com", name: "Maria Santos", role: "MANAGER" as const, department: "IT", phone: "+1 555-0101" },
    { email: "john.reyes@company.com", name: "John Reyes", role: "USER" as const, department: "Engineering", phone: "+1 555-0102" },
    { email: "anna.cruz@company.com", name: "Anna Cruz", role: "USER" as const, department: "HR", phone: "+1 555-0103" },
    { email: "carlos.garcia@company.com", name: "Carlos Garcia", role: "USER" as const, department: "Engineering", phone: "+1 555-0104" },
    { email: "lisa.martinez@company.com", name: "Lisa Martinez", role: "MANAGER" as const, department: "Finance", phone: "+1 555-0105" },
    { email: "mark.delacruz@company.com", name: "Mark Dela Cruz", role: "USER" as const, department: "Marketing", phone: "+1 555-0106" },
    { email: "sarah.kim@company.com", name: "Sarah Kim", role: "USER" as const, department: "Engineering", phone: "+1 555-0107" },
    { email: "david.tan@company.com", name: "David Tan", role: "USER" as const, department: "IT", phone: "+1 555-0108" },
    { email: "jennifer.lee@company.com", name: "Jennifer Lee", role: "USER" as const, department: "HR", phone: null },
    { email: "robert.chen@company.com", name: "Robert Chen", role: "USER" as const, department: "Finance", phone: "+1 555-0110", status: "INACTIVE" as const },
  ];

  for (const user of dummyUsers) {
    const { status, ...userData } = user;
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...userData,
        hashedPassword: userPassword,
        status: status ?? "ACTIVE",
      },
    });
  }
  console.log(`Seeded ${dummyUsers.length} dummy users`);

  // ── Users for asset assignments ─────────────────────────
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
  console.log(`Seeded ${userSeeds.length} asset users`);

  // ── Vendors ─────────────────────────────────────────────
  const vendorSeeds = [
    { name: "Acme Supply Co.", contactEmail: "sales@acmesupply.example", contactPhone: "+1 (415) 555-0142", website: "https://acmesupply.example", notes: "Primary laptop and desktop supplier. Net-30 terms." },
    { name: "MetroTech Partners", contactEmail: "accounts@metrotech.example", contactPhone: "415.555.0188", website: "https://metrotech.example" },
    { name: "BrightPixel Displays", contactEmail: "hello@brightpixel.example", website: "https://brightpixel.example", notes: "Specialty monitors and calibration services." },
    { name: "Northwind Mobile", contactEmail: "support@northwindmobile.example", contactPhone: "+1-212-555-0109" },
    { name: "Quill & Cable", contactEmail: "orders@quillandcable.example", contactPhone: "(646) 555-0174", website: "https://quillandcable.example", notes: "Accessories, cables, and small peripherals." },
    { name: "Summit Hardware", contactEmail: "billing@summithardware.example", website: "https://summithardware.example" },
  ];

  const vendors: Record<string, string> = {};
  for (const v of vendorSeeds) {
    const vendor = await prisma.vendor.upsert({
      where: { id: vendors[v.name] ?? "nonexistent" },
      update: {},
      create: v,
    });
    vendors[vendor.name] = vendor.id;
  }
  console.log(`Seeded ${vendorSeeds.length} vendors`);

  // ── Assets ──────────────────────────────────────────────
  const assetSeeds = [
    { tag: "IT-0001", serial: "SN-WXYZ9876", name: 'MacBook Pro 14"', category: "LAPTOP" as const, status: "ASSIGNED" as const, purchaseDate: new Date("2025-09-04"), purchaseCost: 229900, warrantyExpiresAt: new Date("2028-09-04"), vendorId: vendors["Acme Supply Co."], currentAssigneeId: users["sara.patel@example.com"] },
    { tag: "IT-0002", serial: "SN-ABCD1122", name: "Dell XPS 13", category: "LAPTOP" as const, status: "AVAILABLE" as const, purchaseDate: new Date("2024-04-20"), purchaseCost: 149999, warrantyExpiresAt: new Date("2026-04-20"), vendorId: vendors["Acme Supply Co."] },
    { tag: "IT-0003", serial: "SN-EFGH3344", name: "Lenovo ThinkPad X1 Carbon", category: "LAPTOP" as const, status: "ASSIGNED" as const, purchaseDate: new Date("2025-11-12"), purchaseCost: 189900, warrantyExpiresAt: new Date("2028-11-12"), vendorId: vendors["MetroTech Partners"], currentAssigneeId: users["marco.reyes@example.com"] },
    { tag: "IT-0004", serial: "SN-IJKL5566", name: 'LG UltraFine 27" 4K', category: "MONITOR" as const, status: "AVAILABLE" as const, purchaseDate: new Date("2023-04-05"), purchaseCost: 69900, warrantyExpiresAt: new Date("2026-04-05"), vendorId: vendors["BrightPixel Displays"] },
    { tag: "IT-0005", serial: "SN-MNOP7788", name: 'Dell UltraSharp 32"', category: "MONITOR" as const, status: "ASSIGNED" as const, purchaseDate: new Date("2025-06-18"), purchaseCost: 89900, warrantyExpiresAt: new Date("2028-06-18"), vendorId: vendors["BrightPixel Displays"], currentAssigneeId: users["jordan.kim@example.com"] },
    { tag: "IT-0006", serial: "SN-QRST9900", name: "iPhone 15 Pro", category: "PHONE" as const, status: "ASSIGNED" as const, purchaseDate: new Date("2025-04-30"), purchaseCost: 119900, warrantyExpiresAt: new Date("2026-04-30"), vendorId: vendors["Northwind Mobile"], currentAssigneeId: users["priya.shah@example.com"] },
    { tag: "IT-0007", serial: "SN-UVWX1122", name: "Dell OptiPlex 7090", category: "DESKTOP" as const, status: "RETIRED" as const, purchaseDate: new Date("2023-02-14"), purchaseCost: 124900, warrantyExpiresAt: new Date("2026-02-14"), vendorId: vendors["MetroTech Partners"] },
    { tag: "IT-0008", serial: "SN-YZAB3344", name: "Logitech MX Master 3S", category: "ACCESSORY" as const, status: "AVAILABLE" as const, purchaseDate: new Date("2026-01-10"), purchaseCost: 9999, vendorId: vendors["Quill & Cable"] },
    { tag: "IT-0009", serial: "SN-CDEF5566", name: "HP EliteDesk 800", category: "DESKTOP" as const, status: "ASSIGNED" as const, purchaseDate: new Date("2025-07-22"), purchaseCost: 159900, warrantyExpiresAt: new Date("2028-07-22"), vendorId: vendors["Summit Hardware"], currentAssigneeId: users["alex.nguyen@example.com"] },
    { tag: "IT-0010", serial: "SN-GHIJ7788", name: "Samsung Galaxy S24", category: "PHONE" as const, status: "ASSIGNED" as const, purchaseDate: new Date("2024-04-15"), purchaseCost: 99900, warrantyExpiresAt: new Date("2026-04-15"), vendorId: vendors["Northwind Mobile"], currentAssigneeId: users["admin@company.com"] },
    { tag: "IT-0011", serial: "SN-KLMN9900", name: "Anker USB-C Hub", category: "ACCESSORY" as const, status: "AVAILABLE" as const },
    { tag: "IT-0012", serial: "SN-OPQR1122", name: 'MacBook Air 13"', category: "LAPTOP" as const, status: "AVAILABLE" as const, purchaseDate: new Date("2025-12-03"), purchaseCost: 139900, warrantyExpiresAt: new Date("2027-12-03"), vendorId: vendors["Acme Supply Co."] },
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

  // ── Check Events ────────────────────────────────────────
  const checkEventSeeds = [
    { assetId: assets["IT-0001"], type: "CHECK_OUT" as const, userId: users["sara.patel@example.com"], timestamp: new Date("2026-03-28T14:05:00Z"), notes: "Onboarding — new hire in Engineering." },
    { assetId: assets["IT-0003"], type: "CHECK_OUT" as const, userId: users["marco.reyes@example.com"], timestamp: new Date("2026-03-15T09:30:00Z") },
    { assetId: assets["IT-0002"], type: "CHECK_IN" as const, userId: users["jordan.kim@example.com"], timestamp: new Date("2026-04-02T16:45:00Z"), notes: "Returned after project handoff." },
    { assetId: assets["IT-0005"], type: "CHECK_OUT" as const, userId: users["jordan.kim@example.com"], timestamp: new Date("2026-02-11T11:20:00Z") },
    { assetId: assets["IT-0004"], type: "CHECK_IN" as const, userId: users["priya.shah@example.com"], timestamp: new Date("2026-04-05T10:15:00Z") },
    { assetId: assets["IT-0006"], type: "CHECK_OUT" as const, userId: users["priya.shah@example.com"], timestamp: new Date("2026-01-22T13:00:00Z"), notes: "Loaner for remote work." },
    { assetId: assets["IT-0008"], type: "CHECK_IN" as const, userId: users["alex.nguyen@example.com"], timestamp: new Date("2026-04-08T17:30:00Z") },
    { assetId: assets["IT-0009"], type: "CHECK_OUT" as const, userId: users["alex.nguyen@example.com"], timestamp: new Date("2026-03-27T15:00:00Z"), notes: "Assigned for remote project." },
  ];

  for (const e of checkEventSeeds) {
    await prisma.checkEvent.create({ data: e });
  }
  console.log(`Seeded ${checkEventSeeds.length} check events`);

  // ── Notifications ───────────────────────────────────────
  const notificationSeeds = [
    { title: "Failed login attempt for admin@example.com", body: "Three failed login attempts from IP 203.0.113.42 in the last 5 minutes.", category: "SECURITY" as const, severity: "CRITICAL" as const, read: false, link: "/configuration/roles" },
    { title: "MacBook Pro warranty expires in 14 days", body: "Asset IT-0001 (assigned to S. Patel) warranty ends 2026-04-25.", category: "WARRANTY" as const, severity: "WARNING" as const, read: false, link: "/inventory" },
    { title: "Scheduled maintenance: 2026-04-15 22:00 UTC", body: "Database upgrade window. Expected downtime: 30 minutes.", category: "MAINTENANCE" as const, severity: "INFO" as const, read: false },
    { title: "Backup completed successfully", body: "Nightly snapshot stored. 2.4 GB across 14 tables.", category: "SYSTEM" as const, severity: "INFO" as const, read: true },
    { title: "Dell OptiPlex warranty expired", body: "Asset IT-0007 (retired) warranty ended 2026-02-14.", category: "WARRANTY" as const, severity: "CRITICAL" as const, read: false, link: "/inventory" },
    { title: "New device added: Lenovo ThinkPad X1", body: "Asset IT-0003 created and assigned to M. Reyes.", category: "SYSTEM" as const, severity: "INFO" as const, read: true },
    { title: "Password rotation reminder", body: "Two admin accounts have not rotated passwords in over 90 days.", category: "SECURITY" as const, severity: "WARNING" as const, read: false, link: "/users" },
    { title: "Maintenance window completed", body: "Application server patch applied. No downtime observed.", category: "MAINTENANCE" as const, severity: "INFO" as const, read: true },
  ];

  for (const n of notificationSeeds) {
    await prisma.notification.create({ data: n });
  }
  console.log(`Seeded ${notificationSeeds.length} notifications`);

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
