@echo off
REM ============================================================================
REM DEV DEPLOYMENT SCRIPT
REM Push code from local development to GitHub
REM ============================================================================

color 0A
title CMS Dev Deployment Script

echo.
echo ============================================================================
echo    CMS Development Deployment Script
echo ============================================================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo [1/5] Checking git status...
echo ============================================================================
git status
echo.

echo [2/5] Showing changes...
echo ============================================================================
git diff --stat
echo.

REM Ask for commit message
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update: Changes from development
)

echo.
echo [3/5] Adding all changes to git...
echo ============================================================================
git add .
echo.

echo [4/5] Committing changes...
echo ============================================================================
git commit -m "%COMMIT_MSG%"
echo.

REM Check if commit was successful
if errorlevel 1 (
    echo.
    echo [WARNING] No changes to commit or commit failed
    echo.
    pause
    goto :push_anyway
)

:push_anyway
echo [5/5] Pushing to GitHub...
echo ============================================================================
git push origin main
echo.

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to push to GitHub!
    echo.
    echo Please check:
    echo - Internet connection
    echo - GitHub credentials
    echo - Branch name (main/master)
    echo.
    color 0C
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo    SUCCESS! Code pushed to GitHub
echo ============================================================================
echo.
echo Your changes are now on GitHub.
echo.
echo NEXT STEPS:
echo 1. Wait for GitHub Actions to complete (5-7 minutes)
echo    Check: https://github.com/mominuloculintechbd-droid/cms
echo.
echo 2. On production server, run: prod-update.bat (or prod-update.sh)
echo    This will pull changes and run database migrations
echo.
echo ============================================================================
echo.

color 0A
pause
