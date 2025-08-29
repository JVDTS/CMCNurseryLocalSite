@echo off
echo Starting CMC Nursery Website...
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found!
    echo Please copy env.example to .env and configure your settings.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting development server...
npm run dev

pause
