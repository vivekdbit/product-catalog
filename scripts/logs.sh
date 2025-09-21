#!/bin/bash
# scripts/logs.sh - View logs for services

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo "📝 Log Viewer for Product Catalog"
    echo "================================="
    echo ""
    echo "Usage:"
    echo "   npm run docker:logs                    - View all service logs"
    echo "   npm run docker:logs [service]          - View specific service logs"
    echo "   npm run docker:logs [service] [lines]  - View last N lines"
    echo ""
    echo "Available services:"
    echo "   frontend   - Frontend application logs"
    echo "   backend    - Backend API logs"
    echo "   postgres   - PostgreSQL database logs"
    echo "   redis      - Redis cache logs"
    echo ""
    echo "Examples:"
    echo "   npm run docker:logs backend"
    echo "   npm run docker:logs postgres 50"
    echo "   scripts/logs.sh frontend 100"
}

# Function to check if service exists
service_exists() {
    docker-compose config --services | grep -q "^${1}$"
}

# Function to check if containers are running
check_running_containers() {
    if [ -z "$(docker-compose ps -q)" ]; then
        echo -e "${RED}❌ No running containers found${NC}"
        echo "   Start services with: npm run docker:start"
        exit 1
    fi
}

# Main logic
if [ $# -eq 0 ]; then
    # No arguments - show all logs
    echo -e "${BLUE}📝 Showing logs for all services${NC}"
    echo "   Press Ctrl+C to exit"
    echo "========================================"
    echo ""
    
    check_running_containers
    docker-compose logs -f --tail=100
    
elif [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    # Show help
    show_usage
    
elif [ $# -eq 1 ]; then
    # One argument - service name
    SERVICE=$1
    
    if [ "$SERVICE" = "all" ]; then
        echo -e "${BLUE}📝 Showing logs for all services${NC}"
        echo "   Press Ctrl+C to exit"
        echo "========================================"
        check_running_containers
        docker-compose logs -f --tail=100
    elif service_exists "$SERVICE"; then
        echo -e "${GREEN}📝 Showing logs for service: $SERVICE${NC}"
        echo "   Press Ctrl+C to exit"
        echo "========================================"
        check_running_containers
        docker-compose logs -f --tail=100 "$SERVICE"
    else
        echo -e "${RED}❌ Service '$SERVICE' not found${NC}"
        echo ""
        echo "Available services:"
        docker-compose config --services | sed 's/^/   - /'
        echo ""
        show_usage
        exit 1
    fi
    
elif [ $# -eq 2 ]; then
    # Two arguments - service name and line count
    SERVICE=$1
    LINES=$2
    
    # Validate line count is a number
    if ! [[ "$LINES" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}❌ Line count must be a number${NC}"
        echo "   Example: npm run docker:logs backend 50"
        exit 1
    fi
    
    if service_exists "$SERVICE"; then
        echo -e "${GREEN}📝 Showing last $LINES lines for service: $SERVICE${NC}"
        echo "   Press Ctrl+C to exit"
        echo "========================================"
        check_running_containers
        docker-compose logs -f --tail="$LINES" "$SERVICE"
    else
        echo -e "${RED}❌ Service '$SERVICE' not found${NC}"
        echo ""
        echo "Available services:"
        docker-compose config --services | sed 's/^/   - /'
        exit 1
    fi
    
else
    # Too many arguments
    echo -e "${RED}❌ Too many arguments${NC}"
    echo ""
    show_usage
    exit 1
fi