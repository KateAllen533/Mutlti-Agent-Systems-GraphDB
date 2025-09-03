#!/bin/bash

echo "🚀 Starting Multi-Agent Data System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if pnpm is installed, if not use npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
else
    PACKAGE_MANAGER="npm"
fi

echo "📦 Using package manager: $PACKAGE_MANAGER"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    $PACKAGE_MANAGER install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file from template"
        echo "⚠️  Please update .env with your actual configuration values"
    else
        echo "❌ env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads data temp

# Check if Neo4j is running
echo "🔍 Checking Neo4j connection..."
if ! nc -z localhost 7687 2>/dev/null; then
    echo "⚠️  Neo4j is not running on localhost:7687"
    echo "   Please start Neo4j before running the system:"
    echo "   Docker: docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest"
    echo "   Local: neo4j start"
    echo ""
    echo "   Or update NEO4J_URI in .env to point to your Neo4j instance"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Neo4j is running"
fi

# Start the application
echo ""
echo "🌐 Starting API server on port 3000..."
echo "📊 Starting dashboard on port 3001..."
echo ""
echo "Access the dashboard at: http://localhost:3001"
echo "API health check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop the system"
echo ""

# Start the application
$PACKAGE_MANAGER start
