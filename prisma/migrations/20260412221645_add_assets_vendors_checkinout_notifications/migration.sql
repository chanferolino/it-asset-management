-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('LAPTOP', 'DESKTOP', 'MONITOR', 'PHONE', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "CheckEventType" AS ENUM ('CHECK_OUT', 'CHECK_IN');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('SYSTEM', 'SECURITY', 'MAINTENANCE', 'WARRANTY');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "purchase_date" TIMESTAMP(3),
    "purchase_cost" INTEGER,
    "warranty_expires_at" TIMESTAMP(3),
    "current_assignee_id" TEXT,
    "vendor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_events" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "type" "CheckEventType" NOT NULL,
    "user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_tag_key" ON "assets"("tag");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_events" ADD CONSTRAINT "check_events_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_events" ADD CONSTRAINT "check_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
