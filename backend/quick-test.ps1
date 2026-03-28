# Phase 4.5 - Quick Test Script
$baseUrl = "http://localhost:4000/v1"

Write-Host "Phase 4.5 - Running Tests..." -ForegroundColor Cyan
Write-Host ""

# Login
$loginBody = @{ email = "test@test.com"; password = "Test@123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResp.data.access_token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "✅ Logged in" -ForegroundColor Green

# Create address if needed
try {
    $addrResp = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Get -Headers $headers
    if ($addrResp.data.Count -eq 0) {
        $addrBody = @{
            fullName = "Test User"
            phone = "1234567890"
            addressLine1 = "123 Test St"
            city = "Test City"
            state = "Test State"
            pincode = "123456"
            isDefault = $true
        } | ConvertTo-Json
        $newAddr = Invoke-RestMethod -Uri "$baseUrl/addresses" -Method Post -Headers $headers -Body $addrBody
        $addressId = $newAddr.data.id
    } else {
        $addressId = $addrResp.data[0].id
    }
} catch {
    Write-Host "Error getting address: $_" -ForegroundColor Red
}

Write-Host "✅ Address ready: $addressId" -ForegroundColor Green
Write-Host ""

# TEST 1: Pagination
Write-Host "[TEST 1] Pagination..." -ForegroundColor Yellow
$pageUrl = "$baseUrl/orders/my" + "?page=1" + "&limit=10"
$page1 = Invoke-RestMethod -Uri $pageUrl -Method Get -Headers $headers
if ($page1.success -and $page1.data.meta) {
    Write-Host "✅ PASSED - Total: $($page1.data.meta.total), Pages: $($page1.data.meta.totalPages)" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED" -ForegroundColor Red
}

# TEST 2: Error Format
Write-Host "[TEST 2] Error Handling..." -ForegroundColor Yellow
try {
    $badBody = @{ addressId = "invalid"; notes = "test" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body $badBody | Out-Null
    Write-Host "❌ FAILED - No error thrown" -ForegroundColor Red
} catch {
    $err = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($err.success -eq $false -and $err.statusCode -and $err.message -and $err.timestamp) {
        Write-Host "✅ PASSED - Error format standardized" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED - Invalid error format" -ForegroundColor Red
    }
}

# TEST 3: Response Format
Write-Host "[TEST 3] Response Standardization..." -ForegroundColor Yellow
if ($page1.success -eq $true -and $page1.data -and $page1.timestamp) {
    Write-Host "✅ PASSED - Response format standardized" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED" -ForegroundColor Red
}

# TEST 4: Order Number Uniqueness (Concurrency)
Write-Host "[TEST 4] Order Number Uniqueness (20 concurrent)..." -ForegroundColor Yellow
$jobs = @()
for ($i = 1; $i -le 20; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $headers, $addressId, $num)
        try {
            $body = @{ addressId = $addressId; notes = "Test $num" } | ConvertTo-Json
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
$numbers = $successful | ForEach-Object { $_.orderNumber }
$unique = $numbers | Select-Object -Unique

Write-Host "   Created: $($successful.Count)/20" -ForegroundColor Gray
Write-Host "   Unique: $($unique.Count)" -ForegroundColor Gray

if ($unique.Count -eq $successful.Count -and $successful.Count -gt 0) {
    Write-Host "✅ PASSED - All unique: $($numbers[0]), $($numbers[1]), $($numbers[2])" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED - Duplicates found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
