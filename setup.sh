#!/bin/bash

echo "🚀 Setting up Product Catalog System..."

# Install root dependencies
echo "📦 Installing dependencies..."
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Start database
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev              # Start both backend and frontend"
echo "  npm run dev:backend      # Start only backend (port 3001)"
echo "  npm run dev:frontend     # Start only frontend (port 3000)"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"