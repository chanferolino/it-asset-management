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
    },
  });
  console.log("Seeded admin user:", admin.email);

  const userSeeds = [
    { email: "sara.patel@example.com", name: "Sara Patel" },
    { email: "marco.reyes@example.com", name: "Marco Reyes" },
    { email: "jordan.kim@example.com", name: "Jordan Kim" },
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

  // ── Tickets ─────────────────────────────────────────────
  const ticketSeeds = [
    { title: "Laptop screen flickering", description: "My laptop screen keeps flickering when plugged into the docking station. Started yesterday.", status: "NEW" as const, priority: "HIGH" as const, createdById: users["sara.patel@example.com"] },
    { title: "Request new keyboard", description: "Need a new mechanical keyboard. Current one has sticky keys.", status: "NEW" as const, priority: "LOW" as const, createdById: users["marco.reyes@example.com"] },
    { title: "VPN connection drops frequently", description: "VPN disconnects every 15-20 minutes. Makes remote work impossible.", status: "IN_PROGRESS" as const, priority: "HIGH" as const, createdById: users["jordan.kim@example.com"], assignedToId: admin.id },
    { title: "Install Adobe Creative Suite", description: "Need Adobe CC installed for design work. License should be available.", status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, createdById: users["marco.reyes@example.com"], assignedToId: admin.id },
    { title: "Email not syncing on phone", description: "Work email stopped syncing on my iPhone since the last update.", status: "RESOLVED" as const, priority: "MEDIUM" as const, createdById: users["sara.patel@example.com"], assignedToId: admin.id, resolvedAt: new Date("2026-04-10T14:30:00Z") },
    { title: "Printer jam on 3rd floor", description: "The HP LaserJet on the 3rd floor keeps jamming. Paper tray might be misaligned.", status: "RESOLVED" as const, priority: "LOW" as const, createdById: users["jordan.kim@example.com"], assignedToId: users["sara.patel@example.com"], resolvedAt: new Date("2026-04-09T11:00:00Z") },
    { title: "Set up new hire workstation", description: "New engineer starting Monday. Need full workstation setup: laptop, monitors, peripherals.", status: "NEW" as const, priority: "CRITICAL" as const, createdById: admin.id },
    { title: "Replace broken monitor", description: "Monitor in conference room B has dead pixels. Needs replacement.", status: "CLOSED" as const, priority: "MEDIUM" as const, createdById: users["marco.reyes@example.com"], assignedToId: admin.id, resolvedAt: new Date("2026-04-05T16:00:00Z") },
    { title: "Slow network in building A", description: "Internet speed in building A has been unusually slow this week. Multiple users affected.", status: "IN_PROGRESS" as const, priority: "CRITICAL" as const, createdById: admin.id, assignedToId: admin.id },
    { title: "Update antivirus definitions", description: "Several machines are showing outdated antivirus definitions. Need bulk update.", status: "NEW" as const, priority: "MEDIUM" as const, createdById: users["sara.patel@example.com"] },
  ];

  for (const t of ticketSeeds) {
    await prisma.ticket.create({ data: t });
  }
  console.log(`Seeded ${ticketSeeds.length} tickets`);

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
