@echo off
echo 🚀 Starting Multi-Agent Data System...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if pnpm is installed, if not use npm
pnpm --version >nul 2>&1
if errorlevel 1 (
    set PACKAGE_MANAGER=npm
) else (
    set PACKAGE_MANAGER=pnpm
)

echo 📦 Using package manager: %PACKAGE_MANAGER%

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    %PACKAGE_MANAGER% install
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    if exist "env.example" (
        copy env.example .env
        echo ✅ Created .env file from template
        echo ⚠️  Please update .env with your actual configuration values
    ) else (
        echo ❌ env.example file not found. Please create .env file manually.
        pause
        exit /b 1
    )
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "data" mkdir data
if not exist "temp" mkdir temp

REM Check if Neo4j is running (simplified check)
echo 🔍 Checking Neo4j connection...
echo ⚠️  Please ensure Neo4j is running on localhost:7687
echo    Docker: docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest
echo    Local: neo4j start
echo.
echo    Or update NEO4J_URI in .env to point to your Neo4j instance
echo.

REM Start the application
echo.
echo 🌐 Starting API server on port 3000...
echo 📊 Starting dashboard on port 3001...
echo.
echo Access the dashboard at: http://localhost:3001
echo API health check: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the system
echo.

REM Start the application
%PACKAGE_MANAGER% start
