@echo off
echo Starting CMC Nursery Website in Production Mode...
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found!
    echo Please copy env.example to .env and configure your settings.
    pause
    exit /b 1
)

REM Check if dist directory exists
if not exist "dist" (
    echo Building application for production...
    npm run build
    if errorlevel 1 (
        echo Error: Failed to build application!
        pause
        exit /b 1
    )
)

REM Start the production server
echo Starting production server...
set NODE_ENV=production
npm start

pause
