-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CALLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "chargeback" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "chargeback_amount" DECIMAL(10,2),
ADD COLUMN     "chargeback_date" TIMESTAMP(3),
ADD COLUMN     "is_customer_return" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_manual_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_rto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review_status" "ReviewStatus",
ADD COLUMN     "rule_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shippingPincode" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Order_shippingPincode_idx" ON "Order"("shippingPincode");
