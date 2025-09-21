#!/bin/bash
# scripts/build.sh - Build all Docker images without starting services

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building Product Catalog Docker Images${NC}"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found.${NC}"
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
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Function to build specific service
build_service() {
    local service=$1
    echo -e "${BLUE}🔨 Building $service...${NC}"
    
    if docker-compose build --no-cache "$service"; then
        echo -e "${GREEN}✅ $service built successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to build $service${NC}"
        return 1
    fi
}

# Check for specific service argument
if [ $# -eq 1 ]; then
    SERVICE=$1
    
    # Verify the service exists in docker-compose
    if docker-compose config --services | grep -q "^${SERVICE}$"; then
        echo "🎯 Building specific service: $SERVICE"
        echo ""
        
        if build_service "$SERVICE"; then
            echo ""
            echo -e "${GREEN}🎉 Service '$SERVICE' built successfully!${NC}"
            
            # Show image info
            echo ""
            echo "📦 Image Information:"
            docker images | grep "$SERVICE" | head -1
        else
            echo ""
            echo -e "${RED}❌ Failed to build service '$SERVICE'${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Service '$SERVICE' not found in docker-compose configuration${NC}"
        echo ""
        echo "📋 Available services:"
        docker-compose config --services | sed 's/^/   - /'
        exit 1
    fi
else
    # Build all services
    echo "🏗️  Building all services..."
    echo ""
    
    # Get list of services
    services=($(docker-compose config --services))
    failed_services=()
    
    echo "📋 Services to build:"
    printf '   - %s\n' "${services[@]}"
    echo ""
    
    # Build each service
    for service in "${services[@]}"; do
        if ! build_service "$service"; then
            failed_services+=($service)
        fi
        echo ""
    done
    
    # Report results
    echo "🏁 Build Summary"
    echo "================"
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        echo -e "${GREEN}🎉 All services built successfully!${NC}"
        
        echo ""
        echo "📦 Built Images:"
        docker images | grep -E "(product.*catalog|product_catalog)" | head -10
        
        echo ""
        echo "📊 Image Sizes:"
        docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "(product.*catalog|product_catalog|REPOSITORY)"
        
    else
        echo -e "${RED}❌ Failed to build the following services:${NC}"
        printf '   - %s\n' "${failed_services[@]}"
        echo ""
        echo "💡 Try building them individually to see detailed error messages:"
        for service in "${failed_services[@]}"; do
            echo "   npm run docker:build $service"
        done
        exit 1
    fi
fi

echo ""
echo "🚀 Next Steps:"
echo "   npm run docker:start    - Start all services"
echo "   npm run docker:dev      - Start in development mode"
echo "   docker-compose up -d    - Start services with current images"
echo ""
echo "🔧 Useful Commands:"
echo "   docker images           - List all Docker images"
echo "   docker system df        - Show Docker disk usage"
echo "   npm run docker:clean    - Clean up old images and containers"