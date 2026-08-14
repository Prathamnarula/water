@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════
::  💧 Water Reminder PWA — Single Setup Script (Windows)
:: ═══════════════════════════════════════════════════════════════

title 💧 Water Reminder PWA Setup

echo.
echo   ╔═══════════════════════════════════════╗
echo   ║     💧  Water Reminder PWA Setup     ║
echo   ╚═══════════════════════════════════════╝
echo.

set "REPO_URL=https://github.com/Prathamnarula/water.git"
set "CLONE_DIR=water"

:: ── Step 1: Check for Git ─────────────────────────────────────
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git from https://git-scm.com
    echo         Then restart this script.
    pause
    exit /b 1
)
echo [OK]    Git found

:: ── Step 2: Check / Install Node.js ───────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN]  Node.js not found. Downloading Node.js installer...
    echo         If the browser doesn't open, install manually from https://nodejs.org
    start https://nodejs.org/en/download/package-manager/
    echo [INFO]  After installing Node.js, please re-run this script.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK]    Node.js found: !NODE_VER!

:: ── Step 3: Check for npm ─────────────────────────────────────
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found even though Node.js is installed. Something is wrong.
    pause
    exit /b 1
)
echo [OK]    npm found

:: ── Step 4: Clone or Update ───────────────────────────────────
echo.
echo [INFO]  Setting up project...

if exist "%CLONE_DIR%\.git" (
    echo [WARN]  Folder '%CLONE_DIR%' already exists. Pulling latest...
    cd /d "%CLONE_DIR%"
    git pull --rebase 2>nul
    cd /d "%~dp0"
) else if exist "%CLONE_DIR%" (
    echo [ERROR] Folder '%CLONE_DIR%' exists but is not a git repo. Please remove it first.
    pause
    exit /b 1
) else (
    echo [INFO]  Cloning repository from GitHub...
    git clone "%REPO_URL%" "%CLONE_DIR%"
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to clone. Check internet connection or GitHub access.
        pause
        exit /b 1
    )
    echo [OK]    Repository cloned!
)

cd /d "%CLONE_DIR%"
echo [OK]    Working directory: %cd%

:: ── Step 5: Install Dependencies ──────────────────────────────
echo.
echo [INFO]  Installing dependencies (this may take a minute)...
call npm install
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo [OK]    Dependencies installed!

:: ── Step 6: Setup Database ────────────────────────────────────
if exist "prisma\schema.prisma" (
    echo.
    echo [INFO]  Setting up database...
    call npx prisma generate 2>nul
    call npx prisma db push --accept-data-loss 2>nul
    echo [OK]    Database ready!
)

:: ── Step 7: Build ─────────────────────────────────────────────
echo.
echo [INFO]  Building the app for production...
call npm run build
echo [OK]    Build complete!

:: ── Step 8: Start ─────────────────────────────────────────────
echo.
echo   ╔═══════════════════════════════════════╗
echo   ║   ✅  Setup Complete! Starting App   ║
echo   ╚═══════════════════════════════════════╝
echo.
echo [INFO]  Starting production server on http://localhost:3000
echo [INFO]  Press Ctrl+C to stop the server
echo.
echo [INFO]  To install on your Android phone:
echo         1. Open http://^<your-pc-ip^>:3000 in Chrome on your phone
echo         2. Make sure your phone and PC are on the same WiFi
echo         3. Tap the 3-dot menu in Chrome, then "Add to Home Screen"
echo         4. The app will work as a standalone PWA!
echo.

call npm run start
pause