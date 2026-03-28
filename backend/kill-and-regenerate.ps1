# Kill all Node processes and regenerate Prisma client
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow

# Get all node processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Cyan
    
    foreach ($process in $nodeProcesses) {
        Write-Host "Killing process $($process.Id)..." -ForegroundColor Gray
        Stop-Process -Id $process.Id -Force
    }
    
    Write-Host "✓ All Node.js processes killed" -ForegroundColor Green
    Start-Sleep -Seconds 2
}
else {
    Write-Host "No Node.js processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Regenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma client generated successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can start the server:" -ForegroundColor Cyan
    Write-Host "  npm run start:dev" -ForegroundColor White
}
else {
    Write-Host "✗ Prisma generate failed" -ForegroundColor Red
    Write-Host "Try manually deleting node_modules\.prisma folder and run again" -ForegroundColor Yellow
}
