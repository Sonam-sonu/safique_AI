@echo off
title Safique - Starting Services

echo.
echo ==========================================
echo   Starting Safique (MongoDB + Backend)
echo ==========================================
echo.

:: Start MongoDB
echo [1/2] Starting MongoDB...
start "MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%~dp0..\data\db" --port 27017

:: Wait for MongoDB to be ready
echo Waiting for MongoDB to start...
timeout /t 4 /nobreak > nul

:: Start Backend
echo [2/2] Starting Backend server...
cd /d "%~dp0"
npm run dev
