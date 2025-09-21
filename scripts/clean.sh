#!/bin/bash
# scripts/clean.sh - Clean up Docker resources

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🧹 Docker Cleanup Utility"
echo "========================="
echo ""

# Function to show current Docker usage
show_docker_usage() {
    echo "📊 Current Docker Usage:"
    echo "   Containers: $(docker ps -a --format 'table {{.Names}}' | wc -l) total"
    echo "   Images:     $(docker images --format 'table {{.Repository}}' | wc -l) total"
    echo "   Volumes:    $(docker volume ls --format 'table {{.Name}}' | wc -l) total"
    echo "   Networks:   $(docker network ls --format 'table {{.Name}}' | wc -l) total"
    echo ""
}

show_docker_usage

echo "🛑 Step 1: Stopping and removing containers..."
# Stop and remove containers
docker-compose down 2>/dev/null || echo "   No containers to stop"

echo "✅ Containers stopped and removed"
echo ""

echo "🖼️  Step 2: Removing project images..."
# Remove project-specific images
PROJECT_IMAGES=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep "product.*catalog\|product_catalog" || true)
if [ ! -z "$PROJECT_IMAGES" ]; then
    echo "   Found project images:"
    echo "$PROJECT_IMAGES" | sed 's/^/     /'
    docker-compose down --rmi local 2>/dev/null || true
    echo "✅ Project images removed"
else
    echo "   No project-specific images found"
fi
echo ""

# Volume removal with confirmation
echo "🗄️  Step 3: Data Volume Management"
echo "=================================================="
echo ""

# Check for project volumes
PROJECT_VOLUMES=$(docker volume ls --format "table {{.Name}}" | grep "product.*catalog" || true)

if [ ! -z "$PROJECT_VOLUMES" ]; then
    echo "📦 Found project data volumes:"
    echo "$PROJECT_VOLUMES" | sed 's/^/   - /'
    echo ""
    echo "⚠️  WARNING: This will permanently delete ALL application data!"
    echo "   Including:"
    echo "   - Database records and tables"
    echo "   - Redis cache data"
    echo "   - Application logs"
    echo "   - Any uploaded files"
    echo ""
    
    read -p "🗑️  Delete all data volumes? [y/N]: " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing data volumes..."
        docker-compose down -v 2>/dev/null || true
        
        # Remove volumes by name if docker-compose didn't catch them
        echo "$PROJECT_VOLUMES" | while read -r volume; do
            if [ ! -z "$volume" ] && [ "$volume" != "NAME" ]; then
                docker volume rm "$volume" 2>/dev/null || true
            fi
        done
        
        echo "✅ Data volumes removed"
    else
        echo "📝 Data volumes preserved"
    fi
else
    echo "📝 No project data volumes found"
fi

echo ""
echo "🧽 Step 4: General Docker cleanup..."

# Ask about general cleanup
echo "🔍 Clean up unused Docker resources system-wide?"
echo "   This will remove:"
echo "   - Unused containers"
echo "   - Unused networks"
echo "   - Unused images (dangling)"
echo "   - Build cache"
echo ""

read -p "Proceed with general cleanup? [Y/n]: " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "🧽 Cleaning up unused Docker resources..."
    docker system prune -f
    echo "✅ General cleanup completed"
else
    echo "⏭️  Skipped general cleanup"
fi

echo ""
echo "🧹 Cleanup Summary"
echo "=================="

show_docker_usage

echo "✅ Cleanup completed successfully!"
echo ""
echo "📋 To start fresh:"
echo "   1. npm run docker:setup    (if needed)"
echo "   2. npm run docker:start"
echo ""
echo "💡 Pro tips:"
echo "   - Your source code is always safe"
echo "   - Only Docker containers and volumes are affected"
echo "   - .env file is preserved"
echo "   - Run setup again if you removed volumes"