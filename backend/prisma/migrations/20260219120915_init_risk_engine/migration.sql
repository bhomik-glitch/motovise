-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NORMAL', 'HIGH');

-- CreateTable
CREATE TABLE "pincode_risk" (
    "pincode" TEXT NOT NULL,
    "totalOrders30d" INTEGER NOT NULL DEFAULT 0,
    "rtoCount30d" INTEGER NOT NULL DEFAULT 0,
    "rtoPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'NORMAL',
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pincode_risk_pkey" PRIMARY KEY ("pincode")
);
