-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('OVERALL_RTO', 'PINCODE_RTO', 'CHARGEBACK_RATE', 'MANUAL_REVIEW_QUEUE');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "pincode" VARCHAR(10),
    "metricValue" DECIMAL(10,2) NOT NULL,
    "thresholdValue" DECIMAL(10,2) NOT NULL,
    "status" "AlertStatus" NOT NULL,
    "firstTriggeredAt" TIMESTAMP(3) NOT NULL,
    "lastNotifiedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_type_status_idx" ON "Alert"("type", "status");

-- CreateIndex
CREATE INDEX "Alert_type_status_pincode_idx" ON "Alert"("type", "status", "pincode");
