-- CreateTable
CREATE TABLE "metrics_snapshot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mtdGMV" DECIMAL(10,2) NOT NULL,
    "ordersCount" INTEGER NOT NULL,
    "prepaidCount" INTEGER NOT NULL,
    "prepaidPercentage" DECIMAL(5,2) NOT NULL,
    "rtoRate" DECIMAL(5,2) NOT NULL,
    "chargebackRate" DECIMAL(5,2) NOT NULL,
    "avgShippingCost" DECIMAL(10,2) NOT NULL,
    "manualReviewPending" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "metrics_snapshot_date_key" ON "metrics_snapshot"("date");

-- CreateIndex
CREATE INDEX "metrics_snapshot_date_idx" ON "metrics_snapshot"("date");
