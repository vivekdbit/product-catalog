#!/bin/bash
# scripts/dev.sh - Start development environment

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 Starting Product Catalog in development mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found."
    if [ -f .env.example ]; then
        echo "📝 Please copy .env.example to .env and configure it:"
        echo "   cp .env.example .env"
    else
        echo "📝 Please create .env file or run 'npm run docker:setup' first."
    fi
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Set development environment variables
export NODE_ENV=development
export LOG_LEVEL=DEBUG
export DEV_MODE=true
export FRONTEND_DOCKER_PORT=3000

echo "🔨 Building and starting services in development mode..."
echo ""
echo "🔍 Development Features Enabled:"
echo "   📁 Source code hot reload (frontend & backend)"
echo "   🔍 Verbose logging and debugging"
echo "   📊 Database query logging"
echo "   🔧 Development tools and utilities"
echo "   🐛 Error stack traces"
echo ""
echo "⏳ This may take a moment to build and start..."

# Build and start services with development configuration
echo "Starting services (press Ctrl+C to stop)..."
echo "=========================================="

# Trap Ctrl+C to gracefully stop services
trap 'echo ""; echo "🛑 Stopping development services..."; docker-compose down; exit 0' INT

# Start in foreground so developers can see logs
docker-compose up --build