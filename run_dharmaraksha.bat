@echo off
TITLE DHARMARAKSHA — Full Application Launcher
COLOR 0B
SETLOCAL EnableDelayedExpansion

echo ===============================================================================
echo                D H A R M A R A K S H A
echo    Indian Legal-Document Assistance System with 3D Tribunal Chamber
echo ===============================================================================
echo.

:: 1. Verify Node.js Environment
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Node.js is not found in PATH. Please install Node.js 20+ to proceed.
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Node.js and dependencies...
node -v
echo.

:: 2. Build Workspaces if dist/ folders missing
echo [2/4] Verifying production packages...
IF NOT EXIST "packages\shared-contracts\dist" (
    echo Building shared packages...
    call npm run build --workspace=@dharmaraksha/shared-contracts
    call npm run build --workspace=@dharmaraksha/tribunal-definitions
)

echo.
echo [3/4] Starting DHARMARAKSHA Services:
echo   - [Main API]        http://localhost:5001
echo   - [UNO Q Gateway]   http://localhost:5000
echo   - [Worker Daemon]   Durable Task Scheduler (pg-boss)
echo   - [Laptop Chamber]  http://localhost:3000
echo   - [Phone Kiosk]     http://localhost:3001
echo.

:: 3. Launch Services in Separate Background Windows or Concurrently
echo Starting Main API Server...
start "DHARMARAKSHA - Main API (Port 5001)" cmd /k "cd apps\main-api && npm run dev"

echo Starting UNO Q Gateway...
start "DHARMARAKSHA - UNO Q Gateway (Port 5000)" cmd /k "cd apps\uno-gateway && npm run dev"

echo Starting Worker Daemon...
start "DHARMARAKSHA - Worker Daemon" cmd /k "cd apps\worker && npm run dev"

echo Starting Phone Kiosk Web App...
start "DHARMARAKSHA - Phone Kiosk (Port 3001)" cmd /k "cd apps\phone-web && npm run dev"

echo Starting Laptop 3D Chamber Web App...
start "DHARMARAKSHA - Laptop 3D Chamber (Port 3000)" cmd /k "cd apps\laptop-web && npm run dev"

:: 4. Launch Browser after brief warmup
echo.
echo [4/4] Opening Web Dashboards...
timeout /t 3 /nobreak >nul

start http://localhost:3000
start http://localhost:3001

echo.
echo ===============================================================================
echo   All DHARMARAKSHA services are now running!
echo   - Laptop Chamber: http://localhost:3000
echo   - Phone Kiosk:    http://localhost:3001
echo.
echo   Press any key in this window to stop all DHARMARAKSHA background processes.
echo ===============================================================================
pause >nul

:: Cleanup on exit
echo Stopping services...
taskkill /FI "WINDOWTITLE eq DHARMARAKSHA*" /T /F >nul 2>nul
echo Done.

