@echo off
REM ============================================================================
REM PRODUCTION UPDATE SCRIPT (Windows Version)
REM Pull latest code from GitHub and run database migrations
REM ============================================================================

color 0B
title CMS Production Update Script

REM Configuration - CHANGE THESE TO MATCH YOUR SETUP
set DEPLOY_PATH=C:\inetpub\wwwroot\cms
set BACKEND_DIR=%DEPLOY_PATH%\backend
set FRONTEND_DIR=%DEPLOY_PATH%\frontend
set FRONTEND_DIST=C:\inetpub\wwwroot
set PM2_APP_NAME=cms-backend
set BACKUP_DIR=%DEPLOY_PATH%\backups
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo.
echo ============================================================================
echo    CMS PRODUCTION UPDATE SCRIPT
echo ============================================================================
echo.

REM Create necessary directories
if not exist "%BACKUP_DIR%\database" mkdir "%BACKUP_DIR%\database"
if not exist "%BACKUP_DIR%\code" mkdir "%BACKUP_DIR%\code"
if not exist "%DEPLOY_PATH%\logs" mkdir "%DEPLOY_PATH%\logs"

REM Step 1: Backup current database
echo [1/10] Creating Database Backup...
echo ============================================================================
if exist "%BACKEND_DIR%\database.sqlite" (
    copy "%BACKEND_DIR%\database.sqlite" "%BACKUP_DIR%\database\db_before_update_%TIMESTAMP%.sqlite" >nul
    echo [SUCCESS] Database backed up
) else (
    echo [WARNING] No database file found
)
echo.

REM Step 2: Stop application (if using PM2 on Windows)
echo [2/10] Stopping Application...
echo ============================================================================
pm2 stop %PM2_APP_NAME% 2>nul
if errorlevel 1 (
    echo [WARNING] PM2 not found or app not running
) else (
    echo [SUCCESS] Application stopped
)
echo.

REM Step 3: Backup current code
echo [3/10] Backing Up Current Code...
echo ============================================================================
if exist "%BACKEND_DIR%" (
    echo Backing up backend...
    powershell Compress-Archive -Path "%BACKEND_DIR%" -DestinationPath "%BACKUP_DIR%\code\backend_before_update_%TIMESTAMP%.zip" -Force
    echo [SUCCESS] Backend code backed up
)
echo.

REM Step 4: Pull latest code from GitHub
echo [4/10] Pulling Latest Code from GitHub...
echo ============================================================================
cd /d "%DEPLOY_PATH%"

if not exist ".git" (
    echo [ERROR] Not a git repository!
    echo Please clone your repository first
    pause
    exit /b 1
)

REM Show current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo Current branch: %CURRENT_BRANCH%

REM Stash local changes if any
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    echo Stashing local changes...
    git stash save "Auto-stash before update %TIMESTAMP%" >nul 2>&1
)

REM Pull latest changes
echo Pulling latest changes...
git pull origin %CURRENT_BRANCH%

if errorlevel 1 (
    echo [ERROR] Failed to pull from GitHub!
    pause
    exit /b 1
)

echo [SUCCESS] Code updated from GitHub
echo.

REM Step 5: Update Backend Dependencies
echo [5/10] Updating Backend Dependencies...
echo ============================================================================
cd /d "%BACKEND_DIR%"
call npm ci --production
echo [SUCCESS] Backend dependencies updated
echo.

REM Step 6: Run Database Migrations
echo [6/10] Running Database Migrations...
echo ============================================================================
cd /d "%BACKEND_DIR%"

if exist "migrate.sh" (
    echo [INFO] Found migrate.sh, but running migrations directly...
    call npx sequelize-cli db:migrate
) else (
    call npx sequelize-cli db:migrate
)

if errorlevel 1 (
    echo [WARNING] Migrations may have failed
) else (
    echo [SUCCESS] Database migrations completed
)
echo.

REM Step 7: Update Frontend Dependencies
echo [7/10] Updating Frontend Dependencies...
echo ============================================================================
cd /d "%FRONTEND_DIR%"
call npm ci
echo [SUCCESS] Frontend dependencies updated
echo.

REM Step 8: Build Frontend
echo [8/10] Building Frontend...
echo ============================================================================
call npm run build

if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)

echo [SUCCESS] Frontend built successfully
echo.

REM Step 9: Deploy Frontend
echo [9/10] Deploying Frontend...
echo ============================================================================
if exist "dist" (
    echo Copying files to web root...
    xcopy /E /Y /I "dist\*" "%FRONTEND_DIST%\" >nul
    echo [SUCCESS] Frontend deployed
) else (
    echo [ERROR] Frontend dist folder not found!
)
echo.

REM Step 10: Start Application
echo [10/10] Starting Application...
echo ============================================================================
cd /d "%BACKEND_DIR%"

pm2 restart %PM2_APP_NAME% 2>nul
if errorlevel 1 (
    echo Starting new PM2 process...
    pm2 start src\app.js --name %PM2_APP_NAME%
)

pm2 save >nul 2>&1

timeout /t 3 /nobreak >nul

pm2 list | find "%PM2_APP_NAME%"
if errorlevel 1 (
    echo [ERROR] Application failed to start!
) else (
    echo [SUCCESS] Application is running
)
echo.

REM Final Summary
echo ============================================================================
echo    UPDATE COMPLETED!
echo ============================================================================
echo.
echo Summary:
echo   - Branch: %CURRENT_BRANCH%
echo   - Database backup: %BACKUP_DIR%\database\db_before_update_%TIMESTAMP%.sqlite
echo   - Code backup: %BACKUP_DIR%\code\
echo.
echo Next steps:
echo   - Test your application
echo   - Check PM2 logs: pm2 logs %PM2_APP_NAME%
echo.
echo ============================================================================
echo.

color 0A
pause
