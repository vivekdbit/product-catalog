#!/bin/bash
# scripts/start.sh - Start all services

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Starting Product Catalog in production mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found."
    if [ -f .env.example ]; then
        echo "📝 Please copy .env.example to .env and configure it:"
        echo "   cp .env.example .env"
        echo "   # Then edit .env and update the passwords"
    else
        echo "📝 Please create .env file or run 'npm run docker:setup' first."
    fi
    exit 1
fi

# Check for default passwords
if grep -q "change_this\|example\|password123\|your_password_here" .env; then
    echo "⚠️  WARNING: Default/example passwords detected in .env file!"
    echo "   Please update DB_PASSWORD and REDIS_PASSWORD for security."
    echo "   Generate secure passwords with: openssl rand -base64 32"
    echo ""
    read -p "Continue anyway? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please update your .env file and try again."
        exit 1
    fi
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Set environment variables
export LOG_LEVEL=INFO
export FRONTEND_DOCKER_PORT=80

# Build and start services
echo "🔨 Building and starting services..."
echo "   This may take a few minutes on first run..."

docker-compose up --build -d

echo "⏳ Waiting for services to be healthy..."

# Function to check service health
check_service_health() {
    local service=$1
    local max_attempts=60  # 10 minutes max
    local attempt=1
    
    echo "   Checking $service..."
    
    while [ $attempt -le $max_attempts ]; do
        local status=$(docker-compose ps -q $service | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "starting")
        
        if [ "$status" = "healthy" ]; then
            echo "   ✅ $service is healthy"
            return 0
        elif [ "$status" = "unhealthy" ]; then
            echo "   ❌ $service is unhealthy"
            return 1
        fi
        
        if [ $((attempt % 6)) -eq 0 ]; then  # Show progress every minute
            echo "   ⏳ $service still starting... (${attempt}0s elapsed)"
        fi
        
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo "   ❌ $service failed to become healthy within timeout"
    return 1
}

# Check each service health
services=("postgres" "redis" "backend" "frontend")
failed_services=()

for service in "${services[@]}"; do
    if ! check_service_health $service; then
        failed_services+=($service)
    fi
done

# If any service failed, show logs and exit
if [ ${#failed_services[@]} -ne 0 ]; then
    echo ""
    echo "❌ The following services failed to start properly:"
    printf '   - %s\n' "${failed_services[@]}"
    echo ""
    echo "📝 Showing recent logs for debugging:"
    for service in "${failed_services[@]}"; do
        echo "--- $service logs ---"
        docker-compose logs --tail=20 $service
        echo ""
    done
    echo "💡 Try running 'npm run docker:logs $service' for more details"
    exit 1
fi

# Get port configuration from .env
FRONTEND_PORT=$(grep FRONTEND_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "3000")
BACKEND_PORT=$(grep BACKEND_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "3001")
DB_PORT=$(grep DB_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "5432")
REDIS_PORT=$(grep REDIS_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "6379")

echo ""
echo "🎉 All services are running successfully!"

# Run database migrations
echo ""
echo "🔄 Running database migrations..."
if docker-compose exec -T backend npm run migration:run; then
    echo "✅ Database migrations completed successfully!"
else
    echo "⚠️  Migrations failed or not ready yet. You can run them manually:"
    echo "   npm run docker:migrate run"
    echo "   or: npm run docker:exec:backend"
    echo "   then: npm run migration:run"
fi
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:  http://localhost:${FRONTEND_PORT}"
echo "   Backend:   http://localhost:${BACKEND_PORT}"
echo "   API:       http://localhost:${BACKEND_PORT}/api/v1"
echo "   Health:    http://localhost:${BACKEND_PORT}/api/v1/health"
echo ""
echo "💾 Database connections:"
echo "   PostgreSQL: localhost:${DB_PORT}"
echo "   Redis:      localhost:${REDIS_PORT}"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "📝 Useful commands:"
echo "   npm run docker:logs     - View all logs"
echo "   npm run docker:health   - Check service health"
echo "   npm run docker:stop     - Stop all services"
echo "   npm run docker:restart  - Restart services"
echo ""
echo "🔧 Database Access:"
echo "   npm run docker:exec:postgres - Access PostgreSQL CLI"
echo "   npm run docker:exec:redis    - Access Redis CLI"
echo "   npm run docker:exec:backend  - Access backend shell"
echo ""
echo "🚀 Your application is ready! Visit http://localhost:${FRONTEND_PORT}"