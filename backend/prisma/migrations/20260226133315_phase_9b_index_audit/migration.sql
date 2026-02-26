-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Order_is_manual_review_review_status_createdAt_idx" ON "Order"("is_manual_review", "review_status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_orderStatus_is_rto_idx" ON "Order"("createdAt", "orderStatus", "is_rto");

-- CreateIndex
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId", "status");

-- CreateIndex
CREATE INDEX "pincode_risk_riskLevel_rtoPercentage_idx" ON "pincode_risk"("riskLevel", "rtoPercentage");
