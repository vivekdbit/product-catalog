#!/bin/bash
# scripts/migrate.sh - Database migration helper script

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗃️  Database Migration Manager${NC}"
echo "================================"

# Check if backend container is running
if ! docker-compose ps backend | grep -q "Up"; then
    echo -e "${RED}❌ Backend container is not running${NC}"
    echo "   Start services with: npm run docker:start"
    exit 1
fi

# Function to run migration commands
run_migration_command() {
    local command=$1
    echo -e "${BLUE}🔄 Running: $command${NC}"
    docker-compose exec backend npm run $command
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <command>"
    echo ""
    echo "Available commands:"
    echo "  run              - Run pending migrations"
    echo "  revert           - Revert last migration"
    echo "  show             - Show migration status"
    echo "  generate <name>  - Generate new migration"
    echo "  create <name>    - Create empty migration"
    echo "  reset            - Reset database (drops all data)"
    echo "  seed             - Seed database with sample data"
    echo ""
    echo "Examples:"
    echo "  $0 run"
    echo "  $0 generate AddUserTable"
    echo "  $0 show"
    exit 1
fi

COMMAND=$1

case $COMMAND in
    "run")
        echo -e "${GREEN}📥 Running pending migrations...${NC}"
        run_migration_command "migration:run"
        echo -e "${GREEN}✅ Migrations completed!${NC}"
        ;;
    
    "revert")
        echo -e "${YELLOW}📤 Reverting last migration...${NC}"
        echo -e "${YELLOW}⚠️  This will undo the last migration!${NC}"
        read -p "Are you sure? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_migration_command "migration:revert"
            echo -e "${GREEN}✅ Migration reverted!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    
    "show")
        echo -e "${BLUE}📋 Migration status:${NC}"
        run_migration_command "migration:show"
        ;;
    
    "generate")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please provide a migration name${NC}"
            echo "   Example: $0 generate AddUserTable"
            exit 1
        fi
        MIGRATION_NAME=$2
        echo -e "${GREEN}🔨 Generating migration: $MIGRATION_NAME${NC}"
        docker-compose exec backend npm run migration:generate -- src/database/migrations/$MIGRATION_NAME
        echo -e "${GREEN}✅ Migration generated!${NC}"
        ;;
    
    "create")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please provide a migration name${NC}"
            echo "   Example: $0 create AddUserTable"
            exit 1
        fi
        MIGRATION_NAME=$2
        echo -e "${GREEN}📝 Creating empty migration: $MIGRATION_NAME${NC}"
        docker-compose exec backend npm run migration:create -- src/database/migrations/$MIGRATION_NAME
        echo -e "${GREEN}✅ Empty migration created!${NC}"
        ;;
    
    "reset")
        echo -e "${RED}⚠️  WARNING: This will delete ALL data!${NC}"
        echo "   This action will:"
        echo "   - Drop all tables"
        echo "   - Run all migrations from scratch"
        echo "   - Seed database with sample data"
        echo ""
        read -p "Are you absolutely sure? Type 'RESET' to confirm: " confirm
        if [ "$confirm" = "RESET" ]; then
            echo -e "${YELLOW}🗑️  Resetting database...${NC}"
            run_migration_command "db:reset"
            echo -e "${GREEN}✅ Database reset completed!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    
    "seed")
        echo -e "${GREEN}🌱 Seeding database with sample data...${NC}"
        run_migration_command "db:seed"
        echo -e "${GREEN}✅ Database seeded!${NC}"
        ;;
    
    *)
        echo -e "${RED}❌ Unknown command: $COMMAND${NC}"
        echo "   Run '$0' without arguments to see available commands"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo "   npm run docker:logs backend  - View backend logs"
echo "   npm run docker:exec:postgres - Access PostgreSQL CLI"
echo "   scripts/migrate.sh show      - Check migration status"