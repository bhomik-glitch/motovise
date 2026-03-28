-- ============================================
-- Phase 5 Database Invariant Validation
-- ============================================
-- Run these queries AFTER executing the test suite
-- All queries should return 0 rows for Phase 5 to pass

-- ============================================
-- INVARIANT A: No CONFIRMED order without stock deduction
-- ============================================
SELECT 
    id,
    "orderNumber",
    "orderStatus",
    "stockDeducted",
    "createdAt"
FROM "Order"
WHERE "orderStatus" = 'CONFIRMED'
AND "stockDeducted" = false;

-- Expected: 0 rows
-- If any rows returned: CRITICAL BUG - confirmed order without stock deduction

-- ============================================
-- INVARIANT B: No PAID order without payment ID
-- ============================================
SELECT 
    id,
    "orderNumber",
    "paymentStatus",
    "gatewayPaymentId",
    "createdAt"
FROM "Order"
WHERE "paymentStatus" = 'PAID'
AND "gatewayPaymentId" IS NULL;

-- Expected: 0 rows
-- If any rows returned: CRITICAL BUG - paid order without payment ID

-- ============================================
-- INVARIANT C: No negative stock
-- ============================================
SELECT 
    id,
    name,
    stock,
    "updatedAt"
FROM "Product"
WHERE stock < 0;

-- Expected: 0 rows
-- If any rows returned: CRITICAL BUG - overselling occurred

-- ============================================
-- INVARIANT D: Exactly one inventory log per confirmed order item
-- ============================================
SELECT 
    o.id as "orderId",
    o."orderNumber",
    COUNT(DISTINCT oi.id) as "orderItemCount",
    COUNT(il.id) as "inventoryLogCount"
FROM "Order" o
JOIN "OrderItem" oi ON oi."orderId" = o.id
LEFT JOIN "InventoryLog" il ON il.reference = o.id AND il.type = 'SALE'
WHERE o."orderStatus" = 'CONFIRMED'
GROUP BY o.id, o."orderNumber"
HAVING COUNT(DISTINCT oi.id) != COUNT(il.id);

-- Expected: 0 rows
-- If any rows returned: CRITICAL BUG - inventory log mismatch

-- ============================================
-- ADDITIONAL VALIDATION QUERIES
-- ============================================

-- Check for duplicate stock deductions (should be 0)
SELECT 
    "productId",
    reference as "orderId",
    COUNT(*) as "deductionCount"
FROM "InventoryLog"
WHERE type = 'SALE'
GROUP BY "productId", reference
HAVING COUNT(*) > 1;

-- Expected: 0 rows

-- Check for PENDING orders with stock deducted (should be 0)
SELECT 
    id,
    "orderNumber",
    "orderStatus",
    "stockDeducted"
FROM "Order"
WHERE "orderStatus" = 'PENDING'
AND "stockDeducted" = true;

-- Expected: 0 rows

-- Check for orders with stockDeducted but no inventory logs
SELECT 
    o.id,
    o."orderNumber",
    o."stockDeducted",
    COUNT(il.id) as "logCount"
FROM "Order" o
LEFT JOIN "InventoryLog" il ON il.reference = o.id AND il.type = 'SALE'
WHERE o."stockDeducted" = true
GROUP BY o.id, o."orderNumber", o."stockDeducted"
HAVING COUNT(il.id) = 0;

-- Expected: 0 rows

-- ============================================
-- SUMMARY STATISTICS
-- ============================================

-- Total orders by status
SELECT 
    "orderStatus",
    "paymentStatus",
    "stockDeducted",
    COUNT(*) as count
FROM "Order"
GROUP BY "orderStatus", "paymentStatus", "stockDeducted"
ORDER BY "orderStatus", "paymentStatus", "stockDeducted";

-- Stock deduction summary
SELECT 
    COUNT(*) as "totalOrders",
    SUM(CASE WHEN "stockDeducted" = true THEN 1 ELSE 0 END) as "ordersWithStockDeducted",
    SUM(CASE WHEN "orderStatus" = 'CONFIRMED' THEN 1 ELSE 0 END) as "confirmedOrders",
    SUM(CASE WHEN "paymentStatus" = 'PAID' THEN 1 ELSE 0 END) as "paidOrders"
FROM "Order";
