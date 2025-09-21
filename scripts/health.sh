#!/bin/bash
# scripts/health.sh - Check health of all services

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 Product Catalog Health Check${NC}"
echo "==============================="
echo ""

# Check if .env file exists to get port configuration
if [ -f .env ]; then
    FRONTEND_PORT=$(grep FRONTEND_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "3000")
    BACKEND_PORT=$(grep BACKEND_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "3001")
    DB_PORT=$(grep DB_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "5432")
    REDIS_PORT=$(grep REDIS_PORT .env | cut -d '=' -f2 | tr -d ' ' || echo "6379")
else
    echo -e "${YELLOW}⚠️  .env file not found, using default ports${NC}"
    FRONTEND_PORT=3000
    BACKEND_PORT=3001
    DB_PORT=5432
    REDIS_PORT=6379
fi

# Function to check HTTP endpoint
check_http_endpoint() {
    local name=$1
    local url=$2
    local timeout=${3:-10}
    
    if curl -sf --max-time "$timeout" "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - $url"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - $url (not responding)"
        return 1
    fi
}

# Function to check Docker service health
check_docker_service_health() {
    local service=$1
    local container_id=$(docker-compose ps -q "$service" 2>/dev/null)
    
    if [ -z "$container_id" ]; then
        echo -e "${RED}❌ $service${NC} - Container not running"
        return 1
    fi
    
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "no-health-check")
    local running_status=$(docker inspect --format='{{.State.Status}}' "$container_id" 2>/dev/null || echo "unknown")
    
    if [ "$health_status" = "healthy" ]; then
        echo -e "${GREEN}✅ $service${NC} - Container healthy"
        return 0
    elif [ "$health_status" = "unhealthy" ]; then
        echo -e "${RED}❌ $service${NC} - Container unhealthy"
        return 1
    elif [ "$running_status" = "running" ]; then
        echo -e "${YELLOW}🔄 $service${NC} - Container running (no health check)"
        return 0
    else
        echo -e "${RED}❌ $service${NC} - Container not running ($running_status)"
        return 1
    fi
}

# Function to check database connection
check_database() {
    if docker-compose exec -T postgres pg_isready -U postgres -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL${NC} - Database accepting connections"
        
        # Check if we can connect to the specific database
        if docker-compose exec -T postgres psql -U postgres -d product_catalog -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL Database${NC} - product_catalog database accessible"
        else
            echo -e "${YELLOW}⚠️  PostgreSQL Database${NC} - product_catalog database not accessible"
        fi
        return 0
    else
        echo -e "${RED}❌ PostgreSQL${NC} - Database not accepting connections"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis${NC} - Cache server responding"
        
        # Check Redis info
        local redis_info=$(docker-compose exec -T redis redis-cli info server 2>/dev/null | grep "redis_version" | cut -d: -f2 | tr -d '\r\n' || echo "unknown")
        if [ "$redis_info" != "unknown" ]; then
            echo -e "${GREEN}✅ Redis Version${NC} - $redis_info"
        fi
        return 0
    else
        echo -e "${RED}❌ Redis${NC} - Cache server not responding"
        return 1
    fi
}

# Check if any containers are running
if [ -z "$(docker-compose ps -q)" ]; then
    echo -e "${RED}❌ No containers are running${NC}"
    echo ""
    echo "🚀 To start services:"
    echo "   npm run docker:start    - Start in production mode"
    echo "   npm run docker:dev      - Start in development mode"
    exit 1
fi

echo "📊 Container Status:"
echo "==================="
docker-compose ps
echo ""

echo "🔍 Service Health Checks:"
echo "========================="

# Track overall health
overall_health=0

# Check Docker service health
if ! check_docker_service_health "frontend"; then overall_health=1; fi
if ! check_docker_service_health "backend"; then overall_health=1; fi
if ! check_docker_service_health "postgres"; then overall_health=1; fi
if ! check_docker_service_health "redis"; then overall_health=1; fi

echo ""
echo "🌐 HTTP Endpoint Checks:"
echo "========================"

# Check HTTP endpoints
if ! check_http_endpoint "Frontend" "http://localhost:$FRONTEND_PORT"; then overall_health=1; fi
if ! check_http_endpoint "Backend API" "http://localhost:$BACKEND_PORT/api/v1/health"; then overall_health=1; fi
if ! check_http_endpoint "Backend Info" "http://localhost:$BACKEND_PORT/api"; then overall_health=1; fi

echo ""
echo "💾 Database Connectivity:"
echo "========================="

# Check database and Redis
if ! check_database; then overall_health=1; fi
if ! check_redis; then overall_health=1; fi

echo ""
echo "📋 Port Accessibility:"
echo "======================"

# Check port accessibility
ports=("$FRONTEND_PORT:Frontend" "$BACKEND_PORT:Backend" "$DB_PORT:PostgreSQL" "$REDIS_PORT:Redis")
for port_info in "${ports[@]}"; do
    port=$(echo $port_info | cut -d: -f1)
    service=$(echo $port_info | cut -d: -f2)
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo -e "${GREEN}✅ Port $port${NC} - $service accessible"
    else
        echo -e "${RED}❌ Port $port${NC} - $service not accessible"
        overall_health=1
    fi
done

echo ""
echo "📈 System Resources:"
echo "==================="

# Show Docker system info
echo "🐳 Docker System:"
docker_info=$(docker system df 2>/dev/null || echo "Unable to get Docker info")
echo "$docker_info"

echo ""

# Overall health summary
echo "🏁 Health Summary:"
echo "=================="

if [ $overall_health -eq 0 ]; then
    echo -e "${GREEN}🎉 All systems are healthy!${NC}"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend:  http://localhost:$FRONTEND_PORT"
    echo "   Backend:   http://localhost:$BACKEND_PORT"
    echo "   API:       http://localhost:$BACKEND_PORT/api/v1"
    echo "   Health:    http://localhost:$BACKEND_PORT/api/v1/health"
else
    echo -e "${RED}⚠️  Some services are experiencing issues${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   npm run docker:logs     - View service logs"
    echo "   npm run docker:restart  - Restart services"
    echo "   npm run docker:stop && npm run docker:start - Full restart"
fi

echo ""
echo "💡 Useful Commands:"
echo "   npm run docker:logs [service] - View logs for specific service"
echo "   npm run docker:restart        - Restart all services"
echo "   docker-compose ps             - Show container status"

exit $overall_health