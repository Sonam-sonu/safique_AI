# Run this script as Administrator to start MongoDB
# Right-click this file -> "Run with PowerShell" (as Admin)

Write-Host "Starting MongoDB service..." -ForegroundColor Cyan

try {
    Start-Service MongoDB
    $status = (Get-Service MongoDB).Status
    Write-Host "MongoDB is now: $status" -ForegroundColor Green
} catch {
    Write-Host "Service start failed, trying direct executable..." -ForegroundColor Yellow
    $mongodPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
    $dbPath = "$PSScriptRoot\..\data\db"
    
    if (Test-Path $mongodPath) {
        Start-Process $mongodPath -ArgumentList "--dbpath `"$dbPath`" --port 27017" -WindowStyle Normal
        Write-Host "MongoDB started via executable" -ForegroundColor Green
        Write-Host "DB path: $dbPath" -ForegroundColor Gray
    } else {
        Write-Host "mongod.exe not found at: $mongodPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Now run in your terminal:" -ForegroundColor Cyan
Write-Host "  cd safeher-backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
