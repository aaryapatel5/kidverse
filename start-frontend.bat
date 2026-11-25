
@echo off
title KidVerse - React Frontend

echo ========================================================
echo Starting KidVerse Frontend (Vite on Port 5173)
echo ========================================================

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo.
    echo Node modules not found! Installing dependencies...
    call npm install --legacy-peer-deps
    echo.
)

call npm run dev

pause
