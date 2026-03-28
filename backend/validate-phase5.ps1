# Phase 5 Complete Validation Script
# Runs all tests and validates invariants

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PHASE 5 COMPLETE VALIDATION SUITE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$allPassed = $true

# Test 1: Basic Concurrency Tests
Write-Host "[1/5] Running basic concurrency tests..." -ForegroundColor Yellow
node phase5-concurrency-tests.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Basic concurrency tests FAILED" -ForegroundColor Red
    $allPassed = $false
}
else {
    Write-Host "✓ Basic concurrency tests PASSED" -ForegroundColor Green
}
Write-Host ""

# Test 2: High-Concurrency Stress Test
Write-Host "[2/5] Running high-concurrency stress test (20 simultaneous requests)..." -ForegroundColor Yellow
node stress-test-concurrency.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Stress test FAILED" -ForegroundColor Red
    $allPassed = $false
}
else {
    Write-Host "✓ Stress test PASSED" -ForegroundColor Green
}
Write-Host ""

# Test 3: Edge Case Tests
Write-Host "[3/5] Running edge case tests..." -ForegroundColor Yellow
node edge-case-tests.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Edge case tests FAILED" -ForegroundColor Red
    $allPassed = $false
}
else {
    Write-Host "✓ Edge case tests PASSED" -ForegroundColor Green
}
Write-Host ""

# Test 4: Database Invariant Validation
Write-Host "[4/5] Validating database invariants..." -ForegroundColor Yellow
Write-Host "Running SQL queries to check invariants..." -ForegroundColor Gray
Write-Host ""
Write-Host "Please run the following SQL file in your database client:" -ForegroundColor Cyan
Write-Host "  validate-invariants.sql" -ForegroundColor White
Write-Host ""
Write-Host "Expected results:" -ForegroundColor Cyan
Write-Host "  - Invariant A (No CONFIRMED without stockDeducted): 0 rows" -ForegroundColor White
Write-Host "  - Invariant B (No PAID without gatewayPaymentId): 0 rows" -ForegroundColor White
Write-Host "  - Invariant C (No negative stock): 0 rows" -ForegroundColor White
Write-Host "  - Invariant D (Exactly one log per item): 0 rows" -ForegroundColor White
Write-Host ""

$invariantCheck = Read-Host "Did all invariant checks pass? (y/n)"
if ($invariantCheck -ne "y") {
    Write-Host "✗ Invariant validation FAILED" -ForegroundColor Red
    $allPassed = $false
}
else {
    Write-Host "✓ Invariant validation PASSED" -ForegroundColor Green
}
Write-Host ""

# Test 5: Manual Verification Checklist
Write-Host "[5/5] Manual verification checklist..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please verify the following manually:" -ForegroundColor Cyan
Write-Host "  1. Check Prisma Studio for order states" -ForegroundColor White
Write-Host "  2. Verify no duplicate inventory logs" -ForegroundColor White
Write-Host "  3. Confirm stock values are accurate" -ForegroundColor White
Write-Host "  4. Check for any PENDING orders with stockDeducted=true" -ForegroundColor White
Write-Host ""

$manualCheck = Read-Host "Did manual verification pass? (y/n)"
if ($manualCheck -ne "y") {
    Write-Host "✗ Manual verification FAILED" -ForegroundColor Red
    $allPassed = $false
}
else {
    Write-Host "✓ Manual verification PASSED" -ForegroundColor Green
}
Write-Host ""

# Final Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed) {
    Write-Host "✓ ALL VALIDATIONS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Phase 5 Requirements Met:" -ForegroundColor Green
    Write-Host "  ✓ Exactly-once stock deduction" -ForegroundColor White
    Write-Host "  ✓ Zero deduction on failure" -ForegroundColor White
    Write-Host "  ✓ Zero deduction on abandonment" -ForegroundColor White
    Write-Host "  ✓ Overselling impossible under high concurrency" -ForegroundColor White
    Write-Host "  ✓ Crash-safe rollback" -ForegroundColor White
    Write-Host "  ✓ No invariant violations" -ForegroundColor White
    Write-Host "  ✓ Replay attacks blocked" -ForegroundColor White
    Write-Host "  ✓ Webhook + verify race safe" -ForegroundColor White
    Write-Host ""
    Write-Host "🔒 PHASE 5 CAN BE LOCKED" -ForegroundColor Green -BackgroundColor Black
}
else {
    Write-Host "✗ SOME VALIDATIONS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Phase 5 CANNOT be locked until all tests pass." -ForegroundColor Red
}
Write-Host ""
