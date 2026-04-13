import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Admin",
      hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seeded admin user:", admin.email);

  const settings = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
    },
  });

  console.log("Seeded settings singleton:", settings.id);

  // Seed notifications for the admin user
  const existingCount = await prisma.notification.count({
    where: { userId: admin.id },
  });

  if (existingCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          title: "Failed login attempt for admin@example.com",
          body: "Three failed login attempts from IP 203.0.113.42 in the last 5 minutes.",
          category: "SECURITY",
          severity: "CRITICAL",
          read: false,
          link: "/configuration/roles",
          userId: admin.id,
        },
        {
          title: "MacBook Pro warranty expires in 14 days",
          body: "Asset MBP-2023-014 (assigned to S. Patel) warranty ends 2026-04-25.",
          category: "WARRANTY",
          severity: "WARNING",
          read: false,
          link: "/inventory",
          userId: admin.id,
        },
        {
          title: "Scheduled maintenance: 2026-04-15 22:00 UTC",
          body: "Database upgrade window. Expected downtime: 30 minutes.",
          category: "MAINTENANCE",
          severity: "INFO",
          read: false,
          userId: admin.id,
        },
        {
          title: "Backup completed successfully",
          body: "Nightly snapshot stored. 2.4 GB across 14 tables.",
          category: "SYSTEM",
          severity: "INFO",
          read: true,
          userId: admin.id,
        },
        {
          title: "Dell OptiPlex warranty expired",
          body: "Asset DELL-2021-007 (assigned to IT Loaner Pool) warranty ended 2026-04-08.",
          category: "WARRANTY",
          severity: "CRITICAL",
          read: false,
          link: "/inventory",
          userId: admin.id,
        },
        {
          title: "New device added: Lenovo ThinkPad X1",
          body: "Asset TP-2026-022 created and assigned to M. Reyes.",
          category: "SYSTEM",
          severity: "INFO",
          read: true,
          userId: admin.id,
        },
        {
          title: "Password rotation reminder",
          body: "Two admin accounts have not rotated passwords in over 90 days.",
          category: "SECURITY",
          severity: "WARNING",
          read: false,
          link: "/users",
          userId: admin.id,
        },
        {
          title: "Maintenance window completed",
          body: "Application server patch applied. No downtime observed.",
          category: "MAINTENANCE",
          severity: "INFO",
          read: true,
          userId: admin.id,
        },
      ],
    });
    console.log("Seeded 8 notifications for admin user");
  } else {
    console.log(`Skipping notifications seed (${existingCount} already exist)`);
  }

  // Seed default notification preferences
  await prisma.notificationPreference.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      system: true,
      security: true,
      maintenance: true,
      warranty: true,
      inApp: true,
      email: false,
    },
  });
  console.log("Seeded notification preferences for admin user");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
