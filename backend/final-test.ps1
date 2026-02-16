# Phase 4.5 - Final Concurrency Test (Fixed)
$baseUrl = "http://localhost:4000/v1"
$startTime = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Phase 4.5 - Concurrency Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Login
$loginBody = @{ email = "testuser_phase45@example.com"; password = "Test@1234" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResp.data.accessToken
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "✅ Authenticated" -ForegroundColor Green
Write-Host ""

# Create address
try {
    $addrResp = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Get -Headers $headers
    if ($addrResp.data.Count -eq 0) {
        $addrBody = @{
            fullName = "Test User"
            phone = "1234567890"
            addressLine1 = "123 Test St"
            city = "Test City"
            state = "Test State"
            postalCode = "123456"
            isDefault = $true
        } | ConvertTo-Json
        $newAddr = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Post -Headers $headers -Body $addrBody
        $addressId = $newAddr.data.id
    } else {
        $addressId = $addrResp.data[0].id
    }
    Write-Host "✅ Address ready: $addressId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get address: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST 1: Order Number Uniqueness" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating 20 orders concurrently..." -ForegroundColor Yellow

$jobs = @()
for ($i = 1; $i -le 20; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $headers, $addressId, $num)
        try {
            $body = @{ addressId = $addressId; notes = "Concurrency test $num" } | ConvertTo-Json
            $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json"
            return @{ success = $true; orderNumber = $resp.data.orderNumber; id = $resp.data.id }
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

Write-Host ""
Write-Host "Results:" -ForegroundColor White
Write-Host "  Created: $($successful.Count)/20" -ForegroundColor $(if ($successful.Count -gt 0) { "Green" } else { "Red" })
Write-Host "  Failed: $($failed.Count)" -ForegroundColor $(if ($failed.Count -eq 0) { "Green" } else { "Yellow" })

if ($successful.Count -gt 0) {
    $numbers = $successful | ForEach-Object { $_.orderNumber }
    $unique = $numbers | Select-Object -Unique
    
    Write-Host "  Unique: $($unique.Count)" -ForegroundColor $(if ($unique.Count -eq $successful.Count) { "Green" } else { "Red" })
    Write-Host ""
    Write-Host "Sample order numbers:" -ForegroundColor Gray
    $numbers | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    if ($unique.Count -eq $successful.Count) {
        Write-Host ""
        Write-Host "✅ TEST 1 PASSED - All order numbers unique!" -ForegroundColor Green
        $test1Pass = $true
    } else {
        Write-Host ""
        Write-Host "❌ TEST 1 FAILED - Duplicates found!" -ForegroundColor Red
        $duplicates = $numbers | Group-Object | Where-Object { $_.Count -gt 1 }
        $duplicates | ForEach-Object {
            Write-Host "  Duplicate: $($_.Name) (x$($_.Count))" -ForegroundColor Red
        }
        $test1Pass = $false
    }
} else {
    $test1Pass = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST 2: Pagination" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$pageUrl = "$baseUrl/orders/my" + "?page=1" + "&limit=10"
$page1 = Invoke-RestMethod -Uri $pageUrl -Method Get -Headers $headers

if ($page1.success -and $page1.data.meta) {
    Write-Host "✅ TEST 2 PASSED" -ForegroundColor Green
    Write-Host "  Total orders: $($page1.data.meta.total)" -ForegroundColor Gray
    Write-Host "  Total pages: $($page1.data.meta.totalPages)" -ForegroundColor Gray
    Write-Host "  Current page: $($page1.data.meta.page)" -ForegroundColor Gray
    $test2Pass = $true
} else {
    Write-Host "❌ TEST 2 FAILED" -ForegroundColor Red
    $test2Pass = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST 3: Error Handling" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $badBody = @{ addressId = "invalid-id"; notes = "test" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body $badBody | Out-Null
    Write-Host "❌ TEST 3 FAILED - No error thrown" -ForegroundColor Red
    $test3Pass = $false
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($err.success -eq $false -and $err.statusCode -and $err.message -and $err.timestamp) {
        Write-Host "✅ TEST 3 PASSED - Error format standardized" -ForegroundColor Green
        Write-Host "  Status: $($err.statusCode)" -ForegroundColor Gray
        Write-Host "  Message: $($err.message)" -ForegroundColor Gray
        $test3Pass = $true
    } else {
        Write-Host "❌ TEST 3 FAILED - Invalid error format" -ForegroundColor Red
        $test3Pass = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST 4: Response Format" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($page1.success -eq $true -and $page1.data -and $page1.timestamp) {
    Write-Host "✅ TEST 4 PASSED - Response format standardized" -ForegroundColor Green
    Write-Host "  Has 'success': true" -ForegroundColor Gray
    Write-Host "  Has 'data': true" -ForegroundColor Gray
    Write-Host "  Has 'timestamp': true" -ForegroundColor Gray
    $test4Pass = $true
} else {
    Write-Host "❌ TEST 4 FAILED" -ForegroundColor Red
    $test4Pass = $false
}

$duration = ((Get-Date) - $startTime).TotalSeconds
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = 0
if ($test1Pass) { $passCount++ }
if ($test2Pass) { $passCount++ }
if ($test3Pass) { $passCount++ }
if ($test4Pass) { $passCount++ }

Write-Host "Tests Passed: $passCount/4" -ForegroundColor $(if ($passCount -eq 4) { "Green" } else { "Yellow" })
Write-Host "Duration: $([math]::Round($duration, 2))s" -ForegroundColor Gray
Write-Host ""

if ($passCount -eq 4) {
    Write-Host "🎉 All Phase 4.5 tests PASSED!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review above." -ForegroundColor Yellow
}
