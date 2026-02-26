
# Validates environment and server health
$BaseUrl = "http://localhost:4000/v1"
$ErrorActionPreference = "Stop"

function Log-Pass($msg) { Write-Host "✅ $msg" -ForegroundColor Green }
function Log-Fail($msg) { Write-Host "❌ $msg" -ForegroundColor Red }
function Log-Info($msg) { Write-Host "ℹ️ $msg" -ForegroundColor Cyan }

Add-Type -AssemblyName System.Net.Http

Log-Info "Starting Phase 6 Verification Sequence..."

# 1. Server Health Check
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -ErrorAction Stop
    Log-Pass "Server Health Check Passed"
}
catch {
    Log-Fail "Server is not reachable on port 4000. Is it running?"
    exit 1
}

# 2. Authenticate as Admin
$adminEmail = "admin@example.com"
$adminPass = "Admin123!"
$token = ""

try {
    $login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body (@{
            email    = $adminEmail
            password = $adminPass
        } | ConvertTo-Json) -ContentType "application/json"
    $token = $login.accessToken
    Log-Pass "Admin Authentication Successful"
}
catch {
    Log-Fail "Admin Login Failed. Ensure database is seeded."
    exit 1
}

# 3. Create Test Files
$validJpeg = "test_valid.jpg"
$validPng = "test_valid.png"
$invalidTxt = "test_invalid.txt"
$spoofed = "test_spoofed.jpg"
$oversized = "test_large.jpg"

[IO.File]::WriteAllBytes($validJpeg, [byte[]](0xFF, 0xD8, 0xFF, 0xE0) + (1..100))
[IO.File]::WriteAllBytes($validPng, [byte[]](0x89, 0x50, 0x4E, 0x47) + (1..100))
Set-Content -Path $invalidTxt -Value "This is not an image"
Set-Content -Path $spoofed -Value "This is a text file pretending to be a JPG"
fsutil file createnew $oversized (6 * 1024 * 1024) | Out-Null # 6MB

# Helper to upload using .NET HttpClient
function Test-Upload {
    param($title, $files, $expectStatus)
    Log-Info "Testing: $title"
    
    $client = New-Object System.Net.Http.HttpClient
    $client.DefaultRequestHeaders.Add("Authorization", "Bearer $token")
    
    $content = New-Object System.Net.Http.MultipartFormDataContent
    
    # Add fields
    $content.Add((New-Object System.Net.Http.StringContent("Test Product")), "name")
    $content.Add((New-Object System.Net.Http.StringContent("100")), "price")
    $content.Add((New-Object System.Net.Http.StringContent("10")), "stock")
    
    # Add files
    foreach ($f in $files) {
        $fileBytes = [System.IO.File]::ReadAllBytes($f)
        $fileContent = New-Object System.Net.Http.ByteArrayContent($fileBytes, 0, $fileBytes.Length)
        
        $mime = "image/jpeg"
        if ($f.EndsWith(".txt")) { $mime = "text/plain" }
        $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse($mime)
        
        $content.Add($fileContent, "images", [System.IO.Path]::GetFileName($f))
    }
    
    $response = $client.PostAsync("$BaseUrl/admin/products", $content).Result
    $statusCode = [int]$response.StatusCode
    
    if ($statusCode -eq $expectStatus) {
        Log-Pass "$title - Success ($statusCode)"
        if ($statusCode -eq 201) {
            $jsonStr = $response.Content.ReadAsStringAsync().Result
            return ($jsonStr | ConvertFrom-Json)
        }
    }
    else {
        $err = $response.Content.ReadAsStringAsync().Result
        Log-Fail "$title - Expected $expectStatus but got $statusCode. Response: $err"
    }
    return $null
}

# Run Tests
try {
    # Test 1: Valid Upload (1 Image)
    $p1 = Test-Upload "Valid 1 Image" @($validJpeg) 201
    
    if ($p1) {
        if ($p1.productImages.Count -eq 1 -and $p1.productImages[0].isPrimary) {
            Log-Pass "DB Verification: 1 image, primary flag correct"
        }
        else {
            Log-Fail "DB Verification Failed for Single Image"
        }
    }

    # Test 2: Valid Upload (Max 8 Images)
    $batch = 1..8 | ForEach-Object { $validJpeg }
    $p2 = Test-Upload "Valid 8 Images" $batch 201
    
    # Test 3: Too Many Files (9)
    $batch9 = 1..9 | ForEach-Object { $validJpeg }
    Test-Upload "Too Many Images (9)" $batch9 400
    
    # Test 4: Invalid MIME
    Test-Upload "Invalid MIME Type" @($invalidTxt) 400
    
    # Test 5: Magic Number Check (Spoofed)
    Test-Upload "Spoofed Magic Number" @($spoofed) 400
    
    # Test 6: Oversized File
    Test-Upload "Oversized File (>5MB)" @($oversized) 400
    
    # Cleanup
    if ($p1) { 
        $client = New-Object System.Net.Http.HttpClient
        $client.DefaultRequestHeaders.Add("Authorization", "Bearer $token")
        $client.DeleteAsync("$BaseUrl/admin/products/$($p1.id)").Wait()
        Log-Pass "Cleanup: Deleted Product 1"
    }
    if ($p2) {
        $client = New-Object System.Net.Http.HttpClient
        $client.DefaultRequestHeaders.Add("Authorization", "Bearer $token")
        $client.DeleteAsync("$BaseUrl/admin/products/$($p2.id)").Wait()
        Log-Pass "Cleanup: Deleted Product 2"
    }

}
finally {
    Remove-Item $validJpeg, $validPng, $invalidTxt, $spoofed, $oversized -ErrorAction SilentlyContinue
}
