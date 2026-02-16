# Phase 4.5 - Comprehensive Test Execution Script
# This script runs all mandatory tests and generates a detailed report

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:4000/v1"
$testResults = @()
$startTime = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Phase 4.5 - Concurrency Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Start Time: $startTime" -ForegroundColor Gray
Write-Host ""

# Test server connectivity
Write-Host "[SETUP] Testing server connectivity..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/products?page=1&limit=1" -Method Get -TimeoutSec 5
    if ($healthCheck.success) {
        Write-Host "✅ Server is running and responsive" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Server is not responding. Please ensure dev server is running." -ForegroundColor Red
    Write-Host "   Run: npm run start:dev" -ForegroundColor Yellow
    exit 1
}

# Login to get JWT token
Write-Host ""
Write-Host "[SETUP] Authenticating..." -ForegroundColor Yellow
$testEmail = "admin@example.com"
$testPassword = "Admin@123"

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json) -ContentType "application/json"
    
    $token = $loginResponse.data.access_token
    Write-Host "✅ Authentication successful" -ForegroundColor Green
    Write-Host "   User: $testEmail" -ForegroundColor Gray
} catch {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
    Write-Host "   Please ensure admin user exists with credentials:" -ForegroundColor Yellow
    Write-Host "   Email: $testEmail" -ForegroundColor Yellow
    Write-Host "   Password: $testPassword" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Get user's address
Write-Host ""
Write-Host "[SETUP] Getting user address..." -ForegroundColor Yellow
try {
    $addressResponse = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Get -Headers $headers
    if ($addressResponse.data.Count -gt 0) {
        $addressId = $addressResponse.data[0].id
        Write-Host "✅ Address found: $addressId" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No address found. Creating default address..." -ForegroundColor Yellow
        $newAddress = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Post -Headers $headers -Body (@{
            fullName = "Test User"
            phone = "1234567890"
            addressLine1 = "123 Test Street"
            city = "Test City"
            state = "Test State"
            pincode = "123456"
            isDefault = $true
        } | ConvertTo-Json)
        $addressId = $newAddress.data.id
        Write-Host "✅ Address created: $addressId" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to get/create address: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ============================================
# TEST 1: Pagination Validation
# ============================================
Write-Host ""
Write-Host "📄 TEST 1: Pagination Validation" -ForegroundColor Cyan
Write-Host "Testing order listing pagination..." -ForegroundColor Gray

$test1Start = Get-Date
$test1Passed = $true
$test1Issues = @()

try {
    # Get page 1
    $page1 = Invoke-RestMethod -Uri "$baseUrl/orders/my?page=1&limit=10" -Method Get -Headers $headers
    
    # Verify response structure
    if (-not $page1.success) {
        $test1Passed = $false
        $test1Issues += "Response missing 'success' field"
    }
    
    if (-not $page1.data) {
        $test1Passed = $false
        $test1Issues += "Response missing 'data' field"
    }
    
    if (-not $page1.data.meta) {
        $test1Passed = $false
        $test1Issues += "Response missing 'meta' field"
    } else {
        # Verify metadata fields
        $meta = $page1.data.meta
        if ($null -eq $meta.total) { $test1Issues += "Missing 'total' in metadata" }
        if ($null -eq $meta.page) { $test1Issues += "Missing 'page' in metadata" }
        if ($null -eq $meta.limit) { $test1Issues += "Missing 'limit' in metadata" }
        if ($null -eq $meta.totalPages) { $test1Issues += "Missing 'totalPages' in metadata" }
        
        Write-Host "  Page 1 Results:" -ForegroundColor White
        Write-Host "    Orders: $($page1.data.data.Count)" -ForegroundColor Gray
        Write-Host "    Total: $($meta.total)" -ForegroundColor Gray
        Write-Host "    Total Pages: $($meta.totalPages)" -ForegroundColor Gray
    }
    
    # Get page 2 if available
    if ($page1.data.meta.totalPages -gt 1) {
        $page2 = Invoke-RestMethod -Uri "$baseUrl/orders/my?page=2&limit=10" -Method Get -Headers $headers
        
        # Check for duplicates across pages
        $page1Ids = $page1.data.data | ForEach-Object { $_.id }
        $page2Ids = $page2.data.data | ForEach-Object { $_.id }
        $duplicates = $page1Ids | Where-Object { $page2Ids -contains $_ }
        
        if ($duplicates.Count -gt 0) {
            $test1Passed = $false
            $test1Issues += "Found $($duplicates.Count) duplicate orders across pages"
        } else {
            Write-Host "  ✓ No duplicates across pages" -ForegroundColor Green
        }
    }
    
    if ($test1Issues.Count -gt 0) {
        $test1Passed = $false
    }
    
} catch {
    $test1Passed = $false
    $test1Issues += "Exception: $($_.Exception.Message)"
}

$test1Duration = ((Get-Date) - $test1Start).TotalMilliseconds

if ($test1Passed) {
    Write-Host "✅ TEST 1 PASSED" -ForegroundColor Green
    $testResults += @{
        test = "Pagination Validation"
        status = "PASSED"
        duration = [math]::Round($test1Duration, 2)
        issues = @()
    }
} else {
    Write-Host "❌ TEST 1 FAILED" -ForegroundColor Red
    $test1Issues | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $testResults += @{
        test = "Pagination Validation"
        status = "FAILED"
        duration = [math]::Round($test1Duration, 2)
        issues = $test1Issues
    }
}

# ============================================
# TEST 2: Error Handling Standardization
# ============================================
Write-Host ""
Write-Host "🚨 TEST 2: Error Handling Standardization" -ForegroundColor Cyan
Write-Host "Testing standardized error responses..." -ForegroundColor Gray

$test2Start = Get-Date
$test2Passed = $true
$test2Issues = @()

try {
    # Trigger an error (invalid address ID)
    try {
        Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body (@{
            addressId = "invalid-id-12345"
            notes = "Test error handling"
        } | ConvertTo-Json) | Out-Null
        
        $test2Passed = $false
        $test2Issues += "Expected error but got success response"
    } catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        
        # Verify error format
        if ($null -eq $errorResponse.success) {
            $test2Issues += "Missing 'success' field in error"
        } elseif ($errorResponse.success -ne $false) {
            $test2Issues += "'success' should be false in error response"
        }
        
        if ($null -eq $errorResponse.statusCode) {
            $test2Issues += "Missing 'statusCode' field in error"
        }
        
        if ($null -eq $errorResponse.message) {
            $test2Issues += "Missing 'message' field in error"
        }
        
        if ($null -eq $errorResponse.timestamp) {
            $test2Issues += "Missing 'timestamp' field in error"
        }
        
        if ($test2Issues.Count -eq 0) {
            Write-Host "  ✓ Error format is standardized" -ForegroundColor Green
            Write-Host "    Status Code: $($errorResponse.statusCode)" -ForegroundColor Gray
            Write-Host "    Message: $($errorResponse.message)" -ForegroundColor Gray
        }
    }
} catch {
    $test2Passed = $false
    $test2Issues += "Unexpected exception: $($_.Exception.Message)"
}

$test2Duration = ((Get-Date) - $test2Start).TotalMilliseconds

if ($test2Passed -and $test2Issues.Count -eq 0) {
    Write-Host "✅ TEST 2 PASSED" -ForegroundColor Green
    $testResults += @{
        test = "Error Handling Standardization"
        status = "PASSED"
        duration = [math]::Round($test2Duration, 2)
        issues = @()
    }
} else {
    Write-Host "❌ TEST 2 FAILED" -ForegroundColor Red
    $test2Issues | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $testResults += @{
        test = "Error Handling Standardization"
        status = "FAILED"
        duration = [math]::Round($test2Duration, 2)
        issues = $test2Issues
    }
}

# ============================================
# TEST 3: Response Standardization
# ============================================
Write-Host ""
Write-Host "📦 TEST 3: Response Standardization" -ForegroundColor Cyan
Write-Host "Testing standardized success responses..." -ForegroundColor Gray

$test3Start = Get-Date
$test3Passed = $true
$test3Issues = @()

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/orders/my?page=1&limit=1" -Method Get -Headers $headers
    
    # Verify success format
    if ($null -eq $response.success) {
        $test3Issues += "Missing 'success' field"
    } elseif ($response.success -ne $true) {
        $test3Issues += "'success' should be true"
    }
    
    if ($null -eq $response.data) {
        $test3Issues += "Missing 'data' field"
    }
    
    if ($null -eq $response.timestamp) {
        $test3Issues += "Missing 'timestamp' field"
    }
    
    if ($test3Issues.Count -eq 0) {
        Write-Host "  ✓ Success response format is standardized" -ForegroundColor Green
        Write-Host "    Has 'success': true" -ForegroundColor Gray
        Write-Host "    Has 'data': true" -ForegroundColor Gray
        Write-Host "    Has 'timestamp': true" -ForegroundColor Gray
    }
} catch {
    $test3Passed = $false
    $test3Issues += "Exception: $($_.Exception.Message)"
}

$test3Duration = ((Get-Date) - $test3Start).TotalMilliseconds

if ($test3Passed -and $test3Issues.Count -eq 0) {
    Write-Host "✅ TEST 3 PASSED" -ForegroundColor Green
    $testResults += @{
        test = "Response Standardization"
        status = "PASSED"
        duration = [math]::Round($test3Duration, 2)
        issues = @()
    }
} else {
    Write-Host "❌ TEST 3 FAILED" -ForegroundColor Red
    $test3Issues | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $testResults += @{
        test = "Response Standardization"
        status = "FAILED"
        duration = [math]::Round($test3Duration, 2)
        issues = $test3Issues
    }
}

# ============================================
# TEST 4: Order Number Uniqueness (Concurrency)
# ============================================
Write-Host ""
Write-Host "📝 TEST 4: Order Number Uniqueness (Concurrency)" -ForegroundColor Cyan
Write-Host "Creating 20 orders concurrently..." -ForegroundColor Gray

$test4Start = Get-Date
$test4Passed = $true
$test4Issues = @()

$orderJobs = @()
$concurrentOrders = 20

for ($i = 1; $i -le $concurrentOrders; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $headers, $addressId, $i)
        try {
            $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body (@{
                addressId = $addressId
                notes = "Concurrency test $i"
            } | ConvertTo-Json) -ContentType "application/json"
            return @{
                success = $true
                orderNumber = $response.data.orderNumber
                orderId = $response.data.id
            }
        } catch {
            return @{
                success = $false
                error = $_.Exception.Message
            }
        }
    } -ArgumentList "$baseUrl/orders", $headers, $addressId, $i
    
    $orderJobs += $job
}

Write-Host "  Waiting for orders to complete..." -ForegroundColor Gray
$orderResults = $orderJobs | Wait-Job | Receive-Job
$orderJobs | Remove-Job

$successfulOrders = $orderResults | Where-Object { $_.success -eq $true }
$failedOrders = $orderResults | Where-Object { $_.success -eq $false }

Write-Host ""
Write-Host "  Results:" -ForegroundColor White
Write-Host "    Successful: $($successfulOrders.Count)/$concurrentOrders" -ForegroundColor $(if ($successfulOrders.Count -gt 0) { "Green" } else { "Red" })
Write-Host "    Failed: $($failedOrders.Count)" -ForegroundColor $(if ($failedOrders.Count -eq 0) { "Green" } else { "Yellow" })

if ($successfulOrders.Count -gt 0) {
    $orderNumbers = $successfulOrders | ForEach-Object { $_.orderNumber }
    $uniqueOrderNumbers = $orderNumbers | Select-Object -Unique
    
    Write-Host "    Unique order numbers: $($uniqueOrderNumbers.Count)" -ForegroundColor $(if ($uniqueOrderNumbers.Count -eq $successfulOrders.Count) { "Green" } else { "Red" })
    
    if ($uniqueOrderNumbers.Count -ne $successfulOrders.Count) {
        $test4Passed = $false
        $test4Issues += "Found duplicate order numbers"
        
        # Find duplicates
        $duplicates = $orderNumbers | Group-Object | Where-Object { $_.Count -gt 1 }
        $duplicates | ForEach-Object {
            $test4Issues += "Duplicate: $($_.Name) appeared $($_.Count) times"
        }
    } else {
        Write-Host "  ✓ All order numbers are unique" -ForegroundColor Green
    }
    
    # Show sample order numbers
    Write-Host "  Sample order numbers:" -ForegroundColor Gray
    $orderNumbers | Select-Object -First 5 | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Gray
    }
    
    # Verify format (ORD + YYMMDD + 4 digits)
    $invalidFormat = $orderNumbers | Where-Object { $_ -notmatch '^ORD\d{6}\d{4}$' }
    if ($invalidFormat.Count -gt 0) {
        $test4Passed = $false
        $test4Issues += "Found $($invalidFormat.Count) orders with invalid format"
    } else {
        Write-Host "  ✓ All order numbers have correct format" -ForegroundColor Green
    }
}

$test4Duration = ((Get-Date) - $test4Start).TotalMilliseconds

if ($test4Passed -and $test4Issues.Count -eq 0) {
    Write-Host "✅ TEST 4 PASSED" -ForegroundColor Green
    $testResults += @{
        test = "Order Number Uniqueness"
        status = "PASSED"
        duration = [math]::Round($test4Duration, 2)
        issues = @()
        details = "Created $($successfulOrders.Count) orders, all with unique numbers"
    }
} else {
    Write-Host "❌ TEST 4 FAILED" -ForegroundColor Red
    $test4Issues | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $testResults += @{
        test = "Order Number Uniqueness"
        status = "FAILED"
        duration = [math]::Round($test4Duration, 2)
        issues = $test4Issues
    }
}

# ============================================
# SUMMARY
# ============================================
$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.status -eq "FAILED" }).Count
$total = $testResults.Count

$testResults | ForEach-Object {
    $icon = if ($_.status -eq "PASSED") { "✅" } else { "❌" }
    $color = if ($_.status -eq "PASSED") { "Green" } else { "Red" }
    $duration = if ($_.duration) { " ($($_.duration)ms)" } else { "" }
    Write-Host "$icon $($_.test): $($_.status)$duration" -ForegroundColor $color
    
    if ($_.issues -and $_.issues.Count -gt 0) {
        $_.issues | ForEach-Object {
            Write-Host "   - $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Total: $passed/$total passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
Write-Host "Duration: $([math]::Round($totalDuration, 2))s" -ForegroundColor Gray
Write-Host "End Time: $endTime" -ForegroundColor Gray

# Generate report file
$reportPath = ".\PHASE4.5_TEST_REPORT.md"
$reportContent = @"
# Phase 4.5 - Test Execution Report

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Duration:** $([math]::Round($totalDuration, 2)) seconds  
**Status:** $(if ($passed -eq $total) { "✅ ALL PASSED" } else { "❌ SOME FAILED" })

---

## Test Results Summary

| Test | Status | Duration | Issues |
|------|--------|----------|--------|
$(foreach ($result in $testResults) {
    $issueCount = if ($result.issues) { $result.issues.Count } else { 0 }
    "| $($result.test) | $($result.status) | $($result.duration)ms | $issueCount |"
})

**Overall:** $passed/$total tests passed

---

## Detailed Results

$(foreach ($result in $testResults) {
    @"
### $($result.test)

**Status:** $($result.status)  
**Duration:** $($result.duration)ms

$(if ($result.details) { "**Details:** $($result.details)`n" })
$(if ($result.issues -and $result.issues.Count -gt 0) {
    "**Issues:**`n" + ($result.issues | ForEach-Object { "- $_" }) -join "`n"
} else {
    "✅ No issues found"
})

---

"@
})

## Conclusion

$(if ($passed -eq $total) {
    "✅ **All tests passed successfully!**`n`nPhase 4.5 validation is complete. The implementation is working as expected."
} else {
    "⚠️ **Some tests failed.**`n`nPlease review the issues above and fix before proceeding."
})

---

**Report Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Phase:** 4.5 - Transaction Hardening
"@

$reportContent | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host ""
Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Cyan

if ($passed -eq $total) {
    Write-Host ""
    Write-Host "🎉 All tests passed! Phase 4.5 validation complete." -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Please review and fix issues." -ForegroundColor Yellow
    exit 1
}
