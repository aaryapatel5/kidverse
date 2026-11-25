@echo off
title KidVerse Full-Stack Launcher
echo ========================================================
echo        KidVerse Full-Stack Application Launcher
echo ========================================================
echo.
echo Step 1: Starting Java Spring Boot Backend...
start "KidVerse Backend" "%~dp0start-backend.bat"

echo Step 2: Starting React Frontend...
start "KidVerse Frontend" "%~dp0start-frontend.bat"

echo.
echo Both servers are launching!
echo Backend API : http://localhost:8080/api
echo Frontend UI : http://localhost:5173
echo.
pause
