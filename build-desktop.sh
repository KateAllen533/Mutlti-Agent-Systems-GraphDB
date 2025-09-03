#!/bin/bash

echo "🚀 Building Multi-Agent Data System Desktop Application..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
fi

# Build the React application
echo "⚛️ Building React application..."
npm run build-react
if [ $? -ne 0 ]; then
    echo "❌ Failed to build React application."
    exit 1
fi

# Build the Electron application
echo "⚡ Building Electron application..."
npm run dist
if [ $? -ne 0 ]; then
    echo "❌ Failed to build Electron application."
    exit 1
fi

echo
echo "✅ Desktop application built successfully!"
echo "📦 Installer available in dist/ directory"
echo "🎉 Ready for distribution!"
echo
