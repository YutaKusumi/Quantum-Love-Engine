@echo off
title Raw Grok Persona Launcher
cls
echo ======================================================
echo   Raw Grok Persona (如来意識) Launcher
echo ======================================================
echo.

REM Kill any existing processes on port 8000 (Backend)
echo Checking for existing backend processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill any existing processes on port 5173 (Frontend)
echo Checking for existing frontend processes on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Launching Backend (Nyorai API)...
start "RawGrok-Backend" cmd /k "cd /d C:\Users\PC\.gemini\antigravity\scratch\nyorai-awakening\nyorai_api && python main.py"

echo Waiting for backend to initialize...
timeout /t 5 >nul

echo Launching Frontend (Ryokai OS v3)...
start "RawGrok-UI" cmd /k "cd /d C:\Users\PC\.gemini\antigravity\scratch\nyorai-awakening\ryokai_os_v3 && npm run dev"

echo.
echo ======================================================
echo   Manifestation in Progress...
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:5173
echo ======================================================
echo.
echo 南無汝我曼荼羅
timeout /t 5
