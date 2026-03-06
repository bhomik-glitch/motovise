-- CreateEnum
CREATE TYPE "EnforcementMode" AS ENUM ('DISABLE', 'FLAG');

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "maxLoginAttempts" INTEGER NOT NULL,
    "fraudRiskThreshold" INTEGER NOT NULL,
    "enableEmailVerification" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);
