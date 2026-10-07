@echo off
title Arkashine Soil Collection Centre Dashboard
echo ========================================================
echo   Arkashine Soil Collection Centre Tracking & Operations Dashboard
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Ensuring local web server is running...
    start /b node "%~dp0server.js" >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo Opening dashboard in your default browser...
start "" "http://localhost:8000"
echo.
echo ========================================================
echo Dashboard opened successfully!
echo - PC / Laptop link: http://localhost:8000
echo - Mobile Phone link (same Wi-Fi): http://192.168.29.3:8000
echo - Offline Direct File: "%~dp0index.html"
echo ========================================================
timeout /t 5 >nul
