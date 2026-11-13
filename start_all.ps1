# DHARMARAKSHA — PowerShell System Launcher
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "               D H A R M A R A K S H A" -ForegroundColor Cyan
Write-Host "   Indian Legal-Document Assistance System with 3D Tribunal Chamber" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$nodeVer = node -v 2>$null
if (-not $nodeVer) {
    Write-Host "[ERROR] Node.js is not found. Please install Node.js 20+." -ForegroundColor Red
    exit 1
}

Write-Host "[1/3] Node.js version: $nodeVer" -ForegroundColor Green
Write-Host "[2/3] Starting DHARMARAKSHA microservices in background..." -ForegroundColor Green

# Start services
Start-Process cmd -ArgumentList '/k', 'cd apps\main-api && npm run dev' -WindowStyle Minimized
Start-Process cmd -ArgumentList '/k', 'cd apps\uno-gateway && npm run dev' -WindowStyle Minimized
Start-Process cmd -ArgumentList '/k', 'cd apps\worker && npm run dev' -WindowStyle Minimized
Start-Process cmd -ArgumentList '/k', 'cd apps\phone-web && npm run dev' -WindowStyle Minimized
Start-Process cmd -ArgumentList '/k', 'cd apps\laptop-web && npm run dev' -WindowStyle Minimized

Write-Host "[3/3] Opening browser endpoints..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "  DHARMARAKSHA is now live!" -ForegroundColor White
Write-Host "  - Laptop 3D Chamber: http://localhost:3000" -ForegroundColor White
Write-Host "  - Phone Kiosk:       http://localhost:3001" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Green

