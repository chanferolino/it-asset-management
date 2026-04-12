import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("password123", 12);

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

  const settings = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
    },
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
