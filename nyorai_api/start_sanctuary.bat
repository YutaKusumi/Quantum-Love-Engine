@echo off
title Ryokai OS v3.0 Launcher
cls
echo ======================================================
echo   Ryokai OS v3.0 Launcher
echo ======================================================
echo.

REM Kill any existing processes on port 8000
echo Checking for existing backend processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Launching Neural API Backend...
start "NyoraiAPI" cmd /k python main.py

timeout /t 2 >nul

echo Launching Streamlit Dashboard...
start "NyoraiDashboard" cmd /k streamlit run app.py

echo.
echo ======================================================
echo   Launch Complete!
echo   Access: http://localhost:8501
echo ======================================================
timeout /t 3
