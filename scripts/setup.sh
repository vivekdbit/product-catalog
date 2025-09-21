#!/bin/bash
# scripts/setup.sh - Main setup script

set -e

echo "🐳 Setting up Product Catalog with Docker..."

# Get the project root directory (parent of scripts)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "❌ .env file not found!"
        echo "📝 Please copy .env.example to .env and configure it:"
        echo "   cp .env.example .env"
        echo "   # Then edit .env and update the passwords"
        echo ""
        echo "💡 Generate secure passwords with: openssl rand -base64 32"
        exit 1
    else
        echo "❌ Neither .env nor .env.example file found!"
        echo "📝 Please create .env.example file first or check the project documentation."
        exit 1
    fi
fi

echo "✅ .env file found"

# Generate package-lock.json files if missing
echo "🔐 Ensuring package-lock.json files exist..."
if [ ! -f "backend/package-lock.json" ] || [ ! -f "frontend/package-lock.json" ]; then
    echo "📦 Generating missing package-lock.json files..."
    
    # Generate backend lock file if missing
    if [ ! -f "backend/package-lock.json" ]; then
        echo "   Generating backend/package-lock.json..."
        cd backend && npm install --package-lock-only && cd ..
    fi
    
    # Generate frontend lock file if missing
    if [ ! -f "frontend/package-lock.json" ]; then
        echo "   Generating frontend/package-lock.json..."
        cd frontend && npm install --package-lock-only && cd ..
    fi
    
    # Generate root lock file if missing
    if [ ! -f "package-lock.json" ]; then
        echo "   Generating root package-lock.json..."
        npm install --package-lock-only
    fi
    
    echo "✅ Package lock files generated"
else
    echo "✅ Package lock files exist"
fi

# Check for default/example passwords in .env
if grep -q "change_this\|example\|password123\|your_password_here" .env; then
    echo "⚠️  WARNING: Example/default passwords detected in .env file!"
    echo "   Please update DB_PASSWORD and REDIS_PASSWORD with secure values."
    echo "   Generate secure passwords with: openssl rand -base64 32"
    echo ""
    read -p "Continue setup anyway? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please update your .env file and run setup again."
        exit 1
    fi
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p docker/postgres-init logs

# Create minimal postgres initialization script
echo "📝 Creating minimal PostgreSQL initialization script..."
cat > docker/postgres-init/01-basic-setup.sql << 'EOF'
-- Minimal PostgreSQL setup for TypeORM compatibility

-- Essential Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Basic logging for development
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000;

SELECT pg_reload_conf();

-- Connect to main database
\c product_catalog;

-- Ensure proper permissions
GRANT ALL PRIVILEGES ON DATABASE product_catalog TO postgres;
GRANT ALL ON SCHEMA public TO postgres;

DO $
BEGIN
    RAISE NOTICE '✅ PostgreSQL basic setup completed!';
    RAISE NOTICE 'Ready for TypeORM migrations!';
END $;
EOF

# Create .dockerignore if it doesn't exist
if [ ! -f .dockerignore ]; then
    echo "📝 Creating .dockerignore..."
    cat > .dockerignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env.local
.env.development
.env.test
.env.production

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Build outputs
dist/
build/
.next/

# Docker files
Dockerfile*
docker-compose*.yml
.dockerignore

# Git
.git/
.gitignore
.gitattributes

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp
.cache/

# Scripts directory (since they're for host machine)
scripts/

# Test files
coverage/
.nyc_output/
test-results/

# Documentation
docs/
*.md
!README.md
EOF
fi

# Create logs directory structure
echo "📁 Creating logs directory structure..."
mkdir -p logs/{backend,postgres,redis,nginx}

# Set proper permissions for logs
chmod 755 logs
chmod 755 logs/*

echo "✅ Docker setup complete!"
echo ""
echo "📋 Setup Summary:"
echo "   ✅ Docker dependencies verified"
echo "   ✅ Directory structure created"
echo "   ✅ PostgreSQL initialization scripts created"
echo "   ✅ Development utilities configured"
echo "   ✅ .dockerignore configured"
echo "   ✅ Logs directory prepared"
echo ""
echo "🚀 Next steps:"
echo "   1. Verify your .env configuration"
echo "   2. Run: npm run docker:start"
echo "   3. Visit: http://localhost:3000"
echo ""
echo "🔧 Available commands:"
echo "   npm run docker:start    - Start all services"
echo "   npm run docker:dev      - Start in development mode"
echo "   npm run docker:stop     - Stop all services"
echo "   npm run docker:logs     - View logs"
echo "   npm run docker:health   - Check service health"
echo "   npm run docker:clean    - Clean up everything"
echo ""
echo "💡 Pro tip: Use 'npm run docker:health' to verify everything is working!"