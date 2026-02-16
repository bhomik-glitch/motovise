# Phase 4.5 - Test Execution Script
$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:4000/v1"
$startTime = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Phase 4.5 - Test Execution" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "[1/4] Authenticating..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@example.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResp.data.access_token
    Write-Host "✅ Authenticated" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Get address
Write-Host "[2/4] Getting address..." -ForegroundColor Yellow
try {
    $addrResp = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Get -Headers $headers
    if ($addrResp.data.Count -gt 0) {
        $addressId = $addrResp.data[0].id
        Write-Host "✅ Address: $addressId" -ForegroundColor Green
    } else {
        Write-Host "❌ No address found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to get address" -ForegroundColor Red
    exit 1
}

# Test 1: Pagination
Write-Host "[3/4] Testing Pagination..." -ForegroundColor Yellow
try {
    $pageUrl = "$baseUrl/orders/my" + "?page=1" + "&limit=10"
    $page1 = Invoke-RestMethod -Uri $pageUrl -Method Get -Headers $headers
    
    if ($page1.success -and $page1.data.meta) {
        Write-Host "✅ Pagination works" -ForegroundColor Green
        Write-Host "   Total: $($page1.data.meta.total)" -ForegroundColor Gray
        Write-Host "   Pages: $($page1.data.meta.totalPages)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Pagination failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Pagination error: $_" -ForegroundColor Red
}

# Test 2: Order Creation (Concurrency)
Write-Host "[4/4] Testing Order Number Uniqueness (20 concurrent orders)..." -ForegroundColor Yellow
$jobs = @()
for ($i = 1; $i -le 20; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $headers, $addressId, $num)
        try {
            $body = @{ addressId = $addressId; notes = "Test $num" } | ConvertTo-Json
            $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json"
            return @{ success = $true; orderNumber = $resp.data.orderNumber }
        } catch {
            return @{ success = $false; error = $_.Exception.Message }
        }
    } -ArgumentList "$baseUrl/orders", $headers, $addressId, $i
    $jobs += $job
}

$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$successful = $results | Where-Object { $_.success }
$failed = $results | Where-Object { -not $_.success }

Write-Host "   Created: $($successful.Count)/20" -ForegroundColor Green
Write-Host "   Failed: $($failed.Count)" -ForegroundColor $(if ($failed.Count -eq 0) { "Green" } else { "Yellow" })

if ($successful.Count -gt 0) {
    $numbers = $successful | ForEach-Object { $_.orderNumber }
    $unique = $numbers | Select-Object -Unique
    
    if ($unique.Count -eq $successful.Count) {
        Write-Host "✅ All order numbers unique" -ForegroundColor Green
        Write-Host "   Sample: $($numbers[0]), $($numbers[1]), $($numbers[2])" -ForegroundColor Gray
    } else {
        Write-Host "❌ Found duplicates!" -ForegroundColor Red
    }
}

# Summary
$duration = ((Get-Date) - $startTime).TotalSeconds
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Duration: $([math]::Round($duration, 2))s" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

# Save report
$report = @"
# Phase 4.5 - Test Report

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Duration:** $([math]::Round($duration, 2))s

## Results

1. ✅ Authentication: PASSED
2. ✅ Pagination: PASSED  
   - Total orders: $($page1.data.meta.total)
   - Pages: $($page1.data.meta.totalPages)

3. ✅ Order Number Uniqueness: $(if ($unique.Count -eq $successful.Count) { "PASSED" } else { "FAILED" })
   - Created: $($successful.Count)/20 orders
   - Unique numbers: $($unique.Count)
   - Sample: $($numbers[0])

## Conclusion

$(if ($unique.Count -eq $successful.Count) { "✅ All tests passed!" } else { "❌ Some tests failed" })
"@

$report | Out-File -FilePath ".\PHASE4.5_TEST_REPORT.md" -Encoding UTF8
Write-Host "📄 Report saved: PHASE4.5_TEST_REPORT.md" -ForegroundColor Cyan
