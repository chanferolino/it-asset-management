-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "site_name" TEXT NOT NULL DEFAULT 'IT Asset Management',
    "support_email" TEXT NOT NULL DEFAULT 'support@company.com',
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "smtp_host" TEXT,
    "smtp_from_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
