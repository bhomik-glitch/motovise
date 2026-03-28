# Phase 4.5 - REAL Concurrency Test (CORRECTED)
$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:4000/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REAL CONCURRENCY TEST - Phase 4.5" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "[1/6] Authenticating..." -ForegroundColor Yellow
$loginBody = @{ email = "testuser_phase45@example.com"; password = "Test@1234" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResp.data.accessToken
$userId = $loginResp.data.user.id
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Write-Host "✅ User ID: $userId" -ForegroundColor Green

# Get first available product
Write-Host ""
Write-Host "[2/6] Getting test product..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
$productId = $products.data[0].id
$productName = $products.data[0].name
$initialStock = $products.data[0].stock
Write-Host "✅ Product: $productName (ID: $productId)" -ForegroundColor Green
Write-Host "   Initial stock: $initialStock" -ForegroundColor Gray

# Get/Create Address
Write-Host ""
Write-Host "[3/6] Setting up address..." -ForegroundColor Yellow
$addrResp = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Get -Headers $headers
$addressId = $addrResp.data[0].id
Write-Host "✅ Address: $addressId" -ForegroundColor Green

# Clear cart and add product
Write-Host ""
Write-Host "[4/6] Preparing cart..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/cart/clear" -Method Delete -Headers $headers | Out-Null
} catch {}

$cartBody = @{ productId = $productId; quantity = 1 } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/cart/add" -Method Post -Headers $headers -Body $cartBody | Out-Null
Write-Host "✅ Cart ready (1x $productName)" -ForegroundColor Green

# DB Snapshot BEFORE
Write-Host ""
Write-Host "[5/6] Database snapshot BEFORE..." -ForegroundColor Yellow
$beforeOrders = Invoke-RestMethod -Uri "$baseUrl/orders/my" -Method Get -Headers $headers
$beforeOrderCount = $beforeOrders.data.meta.total
Write-Host "   Orders before: $beforeOrderCount" -ForegroundColor Gray

# Execute 20 Parallel Orders
Write-Host ""
Write-Host "[6/6] EXECUTING 20 PARALLEL ORDERS..." -ForegroundColor Cyan
Write-Host "   Testing order number uniqueness & stock management..." -ForegroundColor Gray
$startTime = Get-Date

$jobs = @()
for ($i = 1; $i -le 20; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $headers, $addressId, $num)
        try {
            $body = @{ addressId = $addressId; notes = "Parallel test #$num" } | ConvertTo-Json
            $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json"
            return @{
                success = $true
                orderNumber = $resp.data.orderNumber
                orderId = $resp.data.id
                total = $resp.data.total
            }
        } catch {
            $errorMsg = "Unknown error"
            if ($_.ErrorDetails.Message) {
                try {
                    $errObj = $_.ErrorDetails.Message | ConvertFrom-Json
                    $errorMsg = $errObj.message
                } catch {
                    $errorMsg = $_.ErrorDetails.Message
                }
            }
            return @{
                success = $false
                error = $errorMsg
            }
        }
    } -ArgumentList "$baseUrl/orders", $headers, $addressId, $i
    $jobs += $job
}

$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
$duration = ((Get-Date) - $startTime).TotalSeconds

$successful = $results | Where-Object { $_.success }
$failed = $results | Where-Object { -not $_.success }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execution:" -ForegroundColor White
Write-Host "   Total requests: 20" -ForegroundColor Gray
Write-Host "   Successful: $($successful.Count)" -ForegroundColor $(if ($successful.Count -gt 0) { "Green" } else { "Red" })
Write-Host "   Failed: $($failed.Count)" -ForegroundColor $(if ($failed.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "   Duration: $([math]::Round($duration, 2))s" -ForegroundColor Gray

if ($successful.Count -gt 0) {
    Write-Host ""
    Write-Host "Order Numbers Generated:" -ForegroundColor White
    $orderNumbers = $successful | ForEach-Object { $_.orderNumber }
    $orderNumbers | Select-Object -First 10 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    if ($orderNumbers.Count -gt 10) {
        Write-Host "   ... and $($orderNumbers.Count - 10) more" -ForegroundColor Gray
    }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Failure Reasons:" -ForegroundColor Yellow
    $failed | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.error)" -ForegroundColor Yellow
    }
}

# DATABASE VERIFICATION
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DATABASE VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check for duplicate order numbers
Write-Host ""
Write-Host "TEST 1: Order Number Uniqueness" -ForegroundColor White
$afterOrders = Invoke-RestMethod -Uri "$baseUrl/orders/my" -Method Get -Headers $headers
$allOrderNumbers = $afterOrders.data.data | ForEach-Object { $_.orderNumber }
$uniqueOrderNumbers = $allOrderNumbers | Select-Object -Unique

if ($uniqueOrderNumbers.Count -eq $allOrderNumbers.Count) {
    Write-Host "   ✅ PASSED - All $($uniqueOrderNumbers.Count) order numbers are unique" -ForegroundColor Green
    $test1Pass = $true
} else {
    Write-Host "   ❌ FAILED - Duplicates found!" -ForegroundColor Red
    $duplicates = $allOrderNumbers | Group-Object | Where-Object { $_.Count -gt 1 }
    $duplicates | ForEach-Object {
        Write-Host "      Duplicate: $($_.Name) (x$($_.Count))" -ForegroundColor Red
    }
    $test1Pass = $false
}

# Verify order number format
Write-Host ""
Write-Host "TEST 2: Order Number Format" -ForegroundColor White
if ($successful.Count -gt 0) {
    $invalidFormat = $orderNumbers | Where-Object { $_ -notmatch '^ORD\d{10}$' }
    if ($invalidFormat.Count -eq 0) {
        Write-Host "   ✅ PASSED - All formats correct (ORD + YYMMDD + 4 digits)" -ForegroundColor Green
        $test2Pass = $true
    } else {
        Write-Host "   ❌ FAILED - Invalid formats: $($invalidFormat.Count)" -ForegroundColor Red
        $test2Pass = $false
    }
} else {
    Write-Host "   ⏭️  SKIPPED - No orders created" -ForegroundColor Yellow
    $test2Pass = $null
}

# Check stock
Write-Host ""
Write-Host "TEST 3: Stock Management" -ForegroundColor White
$productAfter = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get
$finalStock = $productAfter.data.stock
$expectedStock = $initialStock - $successful.Count

Write-Host "   Initial stock: $initialStock" -ForegroundColor Gray
Write-Host "   Orders created: $($successful.Count)" -ForegroundColor Gray
Write-Host "   Expected stock: $expectedStock" -ForegroundColor Gray
Write-Host "   Actual stock: $finalStock" -ForegroundColor Gray

if ($finalStock -eq $expectedStock) {
    Write-Host "   ✅ PASSED - Stock calculation correct" -ForegroundColor Green
    $test3Pass = $true
} else {
    Write-Host "   ❌ FAILED - Stock mismatch!" -ForegroundColor Red
    $test3Pass = $false
}

if ($finalStock -lt 0) {
    Write-Host "   ❌ CRITICAL - Stock is NEGATIVE!" -ForegroundColor Red
    $test3Pass = $false
} else {
    Write-Host "   ✅ Stock is non-negative" -ForegroundColor Green
}

# SUMMARY
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FINAL SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = 0
if ($test1Pass) { $passCount++ }
if ($test2Pass) { $passCount++ }
if ($test3Pass) { $passCount++ }

Write-Host "Tests Passed: $passCount/3" -ForegroundColor $(if ($passCount -eq 3) { "Green" } else { "Yellow" })
Write-Host ""

if ($passCount -eq 3 -and $successful.Count -gt 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "   ✅ No duplicate order numbers" -ForegroundColor Green
    Write-Host "   ✅ Correct order number format" -ForegroundColor Green
    Write-Host "   ✅ Stock management atomic" -ForegroundColor Green
    Write-Host "   ✅ Phase 4.5 transaction hardening VERIFIED" -ForegroundColor Green
} else {
    Write-Host "⚠️  REVIEW REQUIRED" -ForegroundColor Yellow
    if ($successful.Count -eq 0) {
        Write-Host "   No orders were created - check cart/product setup" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Test completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
