#!/bin/bash
# scripts/stop.sh - Stop all services

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🛑 Stopping Product Catalog services..."

# Check if any containers are running
if [ "$(docker-compose ps -q)" ]; then
    echo "📦 Found running containers, stopping them..."
    
    # Stop all services gracefully
    docker-compose down
    
    echo "✅ All services stopped successfully!"
    echo ""
    echo "📝 Notes:"
    echo "   📊 Data volumes are preserved"
    echo "   🔄 To restart: npm run docker:start"
    echo "   🧹 To remove data: npm run docker:clean"
else
    echo "📝 No running containers found"
    echo "ℹ️  Services are already stopped"
fi

echo ""
echo "💡 Quick commands:"
echo "   npm run docker:start    - Start services again"
echo "   npm run docker:dev      - Start in development mode"
echo "   npm run docker:clean    - Clean up everything"