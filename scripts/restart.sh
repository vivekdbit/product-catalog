#!/bin/bash
# scripts/restart.sh - Restart services

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔄 Restarting Product Catalog services..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run 'npm run docker:setup' first."
    exit 1
fi

# Check if any specific service was requested
if [ $# -eq 1 ]; then
    SERVICE=$1
    echo "🔄 Restarting specific service: $SERVICE"
    
    # Verify the service exists in docker-compose
    if docker-compose config --services | grep -q "^${SERVICE}$"; then
        docker-compose restart $SERVICE
        echo "✅ Service '$SERVICE' restarted successfully!"
        
        # Show status of the restarted service
        echo ""
        echo "📊 Service status:"
        docker-compose ps $SERVICE
    else
        echo "❌ Service '$SERVICE' not found in docker-compose configuration"
        echo ""
        echo "📋 Available services:"
        docker-compose config --services | sed 's/^/   - /'
        exit 1
    fi
else
    # Restart all services
    echo "🔄 Restarting all services..."
    
    # Check if services are running
    if [ "$(docker-compose ps -q)" ]; then
        docker-compose restart
        echo "✅ All services restarted successfully!"
    else
        echo "📝 No running services found. Starting services instead..."
        docker-compose up -d
        echo "✅ All services started!"
    fi
fi

echo ""
echo "📊 Current service status:"
docker-compose ps

# Get port configuration from .env for quick reference
FRONTEND_PORT=$(grep FRONTEND_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "3000")
BACKEND_PORT=$(grep BACKEND_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "3001")

echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:${FRONTEND_PORT}"
echo "   Backend:  http://localhost:${BACKEND_PORT}/api/v1/health"
echo ""
echo "📝 Useful commands:"
echo "   npm run docker:logs     - View logs"
echo "   npm run docker:health   - Check health"
echo "   npm run docker:stop     - Stop services"
echo ""
echo "💡 To restart a specific service: npm run docker:restart [service-name]"
echo "   Available services: frontend, backend, postgres, redis"