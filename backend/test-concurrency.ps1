# Phase 4.5 Concurrency Test Script
# This script tests the critical race condition fixes via HTTP requests

$baseUrl = "http://localhost:4000/v1"
$testResults = @()

Write-Host "🧪 Phase 4.5 - Concurrency Testing" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test credentials (you'll need to update these)
$testEmail = "admin@example.com"
$testPassword = "Admin@123"

Write-Host "⚠️  SETUP REQUIRED:" -ForegroundColor Yellow
Write-Host "1. Ensure you have a test user account" -ForegroundColor Yellow
Write-Host "2. Update the credentials in this script" -ForegroundColor Yellow
Write-Host "3. Ensure you have test products and addresses" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to continue or Ctrl+C to cancel..."
Read-Host

# Login to get JWT token
Write-Host "🔐 Logging in..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json) -ContentType "application/json"
    
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    Write-Host "Please update the test credentials in the script" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Order Number Uniqueness
Write-Host ""
Write-Host "📝 Test 1: Order Number Uniqueness" -ForegroundColor Cyan
Write-Host "Creating 20 orders concurrently..." -ForegroundColor Gray

$orderJobs = @()
$concurrentOrders = 20

# Get user's first address
try {
    $addressResponse = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Get -Headers $headers
    $addressId = $addressResponse.data[0].id
    
    if (-not $addressId) {
        Write-Host "❌ No address found. Please create an address first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to get address: $_" -ForegroundColor Red
    exit 1
}

# Create orders concurrently using background jobs
for ($i = 1; $i -le $concurrentOrders; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $headers, $addressId, $i)
        try {
            $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body (@{
                addressId = $addressId
                notes = "Concurrency test $i"
            } | ConvertTo-Json)
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

# Wait for all jobs to complete
Write-Host "Waiting for orders to complete..." -ForegroundColor Gray
$orderResults = $orderJobs | Wait-Job | Receive-Job
$orderJobs | Remove-Job

$successfulOrders = $orderResults | Where-Object { $_.success -eq $true }
$failedOrders = $orderResults | Where-Object { $_.success -eq $false }

Write-Host ""
Write-Host "Results:" -ForegroundColor White
Write-Host "  Successful: $($successfulOrders.Count)/$concurrentOrders" -ForegroundColor $(if ($successfulOrders.Count -gt 0) { "Green" } else { "Red" })
Write-Host "  Failed: $($failedOrders.Count)" -ForegroundColor $(if ($failedOrders.Count -eq 0) { "Green" } else { "Yellow" })

if ($successfulOrders.Count -gt 0) {
    $orderNumbers = $successfulOrders | ForEach-Object { $_.orderNumber }
    $uniqueOrderNumbers = $orderNumbers | Select-Object -Unique
    
    Write-Host "  Unique order numbers: $($uniqueOrderNumbers.Count)" -ForegroundColor $(if ($uniqueOrderNumbers.Count -eq $successfulOrders.Count) { "Green" } else { "Red" })
    
    if ($uniqueOrderNumbers.Count -eq $successfulOrders.Count) {
        Write-Host "✅ Test 1 PASSED: All order numbers are unique" -ForegroundColor Green
        $testResults += @{ test = "Order Number Uniqueness"; status = "PASSED" }
    } else {
        Write-Host "❌ Test 1 FAILED: Duplicate order numbers detected" -ForegroundColor Red
        $testResults += @{ test = "Order Number Uniqueness"; status = "FAILED" }
        
        # Show duplicates
        $duplicates = $orderNumbers | Group-Object | Where-Object { $_.Count -gt 1 }
        if ($duplicates) {
            Write-Host "  Duplicates:" -ForegroundColor Red
            $duplicates | ForEach-Object { Write-Host "    $($_.Name): $($_.Count) times" -ForegroundColor Red }
        }
    }
    
    # Show sample order numbers
    Write-Host "  Sample order numbers:" -ForegroundColor Gray
    $orderNumbers | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ Test 1 FAILED: No successful orders created" -ForegroundColor Red
    $testResults += @{ test = "Order Number Uniqueness"; status = "FAILED" }
}

# Test 2: Pagination
Write-Host ""
Write-Host "📄 Test 2: Pagination" -ForegroundColor Cyan
Write-Host "Testing order listing pagination..." -ForegroundColor Gray

try {
    # Get page 1
    $page1 = Invoke-RestMethod -Uri "$baseUrl/orders/my?page=1&limit=10" -Method Get -Headers $headers
    
    # Get page 2
    $page2 = Invoke-RestMethod -Uri "$baseUrl/orders/my?page=2&limit=10" -Method Get -Headers $headers
    
    Write-Host ""
    Write-Host "Results:" -ForegroundColor White
    Write-Host "  Page 1 orders: $($page1.data.data.Count)" -ForegroundColor Green
    Write-Host "  Page 2 orders: $($page2.data.data.Count)" -ForegroundColor Green
    Write-Host "  Total orders: $($page1.data.meta.total)" -ForegroundColor Green
    Write-Host "  Total pages: $($page1.data.meta.totalPages)" -ForegroundColor Green
    
    # Check for duplicates across pages
    $page1Ids = $page1.data.data | ForEach-Object { $_.id }
    $page2Ids = $page2.data.data | ForEach-Object { $_.id }
    $duplicateIds = $page1Ids | Where-Object { $page2Ids -contains $_ }
    
    if ($duplicateIds.Count -eq 0) {
        Write-Host "✅ Test 2 PASSED: Pagination working correctly, no duplicates across pages" -ForegroundColor Green
        $testResults += @{ test = "Pagination"; status = "PASSED" }
    } else {
        Write-Host "❌ Test 2 FAILED: Duplicate orders found across pages" -ForegroundColor Red
        $testResults += @{ test = "Pagination"; status = "FAILED" }
    }
} catch {
    Write-Host "❌ Test 2 FAILED: $_" -ForegroundColor Red
    $testResults += @{ test = "Pagination"; status = "FAILED" }
}

# Test 3: Error Handling Standardization
Write-Host ""
Write-Host "🚨 Test 3: Error Handling Standardization" -ForegroundColor Cyan
Write-Host "Testing standardized error responses..." -ForegroundColor Gray

try {
    # Try to create order without address (should fail)
    $errorResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body (@{
        addressId = "invalid-id"
        notes = "Test"
    } | ConvertTo-Json)
    
    Write-Host "❌ Test 3 FAILED: Expected error but got success" -ForegroundColor Red
    $testResults += @{ test = "Error Handling"; status = "FAILED" }
} catch {
    $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "Results:" -ForegroundColor White
    Write-Host "  Error response received: ✓" -ForegroundColor Green
    
    # Check for standardized error format
    $hasSuccess = $null -ne $errorObj.success
    $hasStatusCode = $null -ne $errorObj.statusCode
    $hasMessage = $null -ne $errorObj.message
    $hasTimestamp = $null -ne $errorObj.timestamp
    
    Write-Host "  Has 'success' field: $(if ($hasSuccess) { '✓' } else { '✗' })" -ForegroundColor $(if ($hasSuccess) { "Green" } else { "Red" })
    Write-Host "  Has 'statusCode' field: $(if ($hasStatusCode) { '✓' } else { '✗' })" -ForegroundColor $(if ($hasStatusCode) { "Green" } else { "Red" })
    Write-Host "  Has 'message' field: $(if ($hasMessage) { '✓' } else { '✗' })" -ForegroundColor $(if ($hasMessage) { "Green" } else { "Red" })
    Write-Host "  Has 'timestamp' field: $(if ($hasTimestamp) { '✓' } else { '✗' })" -ForegroundColor $(if ($hasTimestamp) { "Green" } else { "Red" })
    
    if ($hasSuccess -and $hasStatusCode -and $hasMessage -and $hasTimestamp) {
        Write-Host "✅ Test 3 PASSED: Error response format is standardized" -ForegroundColor Green
        $testResults += @{ test = "Error Handling"; status = "PASSED" }
    } else {
        Write-Host "❌ Test 3 FAILED: Error response format is not standardized" -ForegroundColor Red
        $testResults += @{ test = "Error Handling"; status = "FAILED" }
    }
}

# Test 4: Response Standardization
Write-Host ""
Write-Host "📦 Test 4: Response Standardization" -ForegroundColor Cyan
Write-Host "Testing standardized success responses..." -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/orders/my?page=1&limit=1" -Method Get -Headers $headers
    
    Write-Host ""
    Write-Host "Results:" -ForegroundColor White
    
    $hasSuccess = $null -ne $response.success
    $hasData = $null -ne $response.data
    $hasTimestamp = $null -ne $response.timestamp
    
    Write-Host "  Has 'success' field: $(if ($hasSuccess) { '✓' } else { '✗' })" -ForegroundColor $(if ($hasSuccess) { "Green" } else { "Red" })
    Write-Host "  Has 'data' field: $(if ($hasData) { '✓' } else { '✗' })" -ForegroundColor $(if ($hasData) { "Green" } else { "Red" })
    Write-Host "  Has 'timestamp' field: $(if ($hasTimestamp) { '✓' } else { '✗' })" -ForegroundColor $(if ($hasTimestamp) { "Green" } else { "Red" })
    Write-Host "  Success value: $($response.success)" -ForegroundColor $(if ($response.success -eq $true) { "Green" } else { "Red" })
    
    if ($hasSuccess -and $hasData -and $hasTimestamp -and $response.success -eq $true) {
        Write-Host "✅ Test 4 PASSED: Success response format is standardized" -ForegroundColor Green
        $testResults += @{ test = "Response Standardization"; status = "PASSED" }
    } else {
        Write-Host "❌ Test 4 FAILED: Success response format is not standardized" -ForegroundColor Red
        $testResults += @{ test = "Response Standardization"; status = "FAILED" }
    }
} catch {
    Write-Host "❌ Test 4 FAILED: $_" -ForegroundColor Red
    $testResults += @{ test = "Response Standardization"; status = "FAILED" }
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.status -eq "FAILED" }).Count
$total = $testResults.Count

$testResults | ForEach-Object {
    $color = if ($_.status -eq "PASSED") { "Green" } else { "Red" }
    $icon = if ($_.status -eq "PASSED") { "✅" } else { "❌" }
    Write-Host "$icon $($_.test): $($_.status)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Total: $passed/$total passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host ""
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Review the results above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: This script tests the implemented fixes that don't require migration." -ForegroundColor Gray
Write-Host "For full testing (including stock deduction and payment verification)," -ForegroundColor Gray
Write-Host "run the migration first: npx prisma migrate dev" -ForegroundColor Gray
