@echo off
echo 🚀 Building Multi-Agent Data System Desktop Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Build the React application
echo ⚛️ Building React application...
npm run build-react
if %errorlevel% neq 0 (
    echo ❌ Failed to build React application.
    pause
    exit /b 1
)

REM Build the Electron application
echo ⚡ Building Electron application...
npm run dist
if %errorlevel% neq 0 (
    echo ❌ Failed to build Electron application.
    pause
    exit /b 1
)

echo.
echo ✅ Desktop application built successfully!
echo 📦 Installer available in dist/ directory
echo 🎉 Ready for distribution!
echo.
pause
