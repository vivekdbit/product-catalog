#!/bin/bash
# scripts/generate-lockfiles.sh - Generate package-lock.json files if missing

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔐 Checking for package-lock.json files..."

# Check backend
if [ ! -f "backend/package-lock.json" ]; then
    echo "📦 Generating package-lock.json for backend..."
    cd backend
    npm install --package-lock-only
    cd ..
    echo "✅ Backend package-lock.json generated"
else
    echo "✅ Backend package-lock.json exists"
fi

# Check frontend
if [ ! -f "frontend/package-lock.json" ]; then
    echo "📦 Generating package-lock.json for frontend..."
    cd frontend
    npm install --package-lock-only
    cd ..
    echo "✅ Frontend package-lock.json generated"
else
    echo "✅ Frontend package-lock.json exists"
fi

# Check root
if [ ! -f "package-lock.json" ]; then
    echo "📦 Generating package-lock.json for root..."
    npm install --package-lock-only
    echo "✅ Root package-lock.json generated"
else
    echo "✅ Root package-lock.json exists"
fi

echo ""
echo "🎉 All package-lock.json files are ready!"
echo ""
echo "💡 Note: The updated Dockerfiles will work with or without lock files,"
echo "   but having them ensures consistent dependency versions."