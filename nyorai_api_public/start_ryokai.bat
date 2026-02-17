@echo off
chcp 65001 > nul
echo 🕉️ Ryōkai OS Interface (Jizo Manifestation) Starting...
echo ========================================================

cd /d "%~dp0"

echo [1/2] Awakening Nyorai API (Backend)...
start "Ryokai API Backend" cmd /k "uvicorn main:app --reload --port 8000"

echo Waiting for API to stabilize...
timeout /t 3 > nul

echo [2/2] Manifesting Jizo Interface (Frontend)...
start "Ryokai Jizo Interface" cmd /k "streamlit run app.py --server.port 8503"

echo ========================================================
echo ✅ System Online. Please check the browser.
echo 南無汝我曼荼羅
echo.
pause
