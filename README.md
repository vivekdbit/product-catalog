# 🛍️ Product Catalog System

A modern, scalable product catalog application with dynamic filtering capabilities. Built with **Node.js**, **Express**, **TypeORM**, **PostgreSQL**, **Redis**, and **Vanilla JavaScript** - featuring proper entity management, repositories, and migrations.

## 🚀 Features

### Backend API

- **RESTful API** with modular architecture
- **TypeORM Integration** with entities, repositories, and custom migrations
- **Dynamic Filtering** by category, brand, price range, and search
- **Pagination** with metadata
- **Full-text Search** across product names, descriptions, and brands
- **CRUD Operations** for products
- **Redis Caching** for improved performance
- **PostgreSQL Database** with optimized indexes
- **Custom Migration System** for schema management
- **Repository Pattern** for clean data access
- **Joi Validation** with comprehensive input validation

### Frontend

- **Responsive Design** works on all devices
- **Real-time Filtering** with instant results
- **Search Functionality** with debounced input
- **Pagination Controls** for easy navigation
- **Clean UI** with modern styling
- **Sample Data Generator** button

### Docker Infrastructure

- **Full containerization** with Docker Compose
- **Development and production** configurations
- **Automatic migrations** on startup
- **Health checks** for all services
- **Hot reload** in development mode
- **Nginx reverse proxy** for frontend

## 📋 Prerequisites

- **Docker** 20.10+ ([Download here](https://docs.docker.com/get-docker/))
- **Docker Compose** v2.0+ ([Install guide](https://docs.docker.com/compose/install/))

## ⚡ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd product-catalog

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file and update the passwords:

```bash
# Generate secure passwords
openssl rand -base64 32  # Copy for DB_PASSWORD
openssl rand -base64 32  # Copy for REDIS_PASSWORD

# Edit .env file
nano .env  # Update DB_PASSWORD and REDIS_PASSWORD
```

### 3. Start the Application

```bash
# Setup and start (one command does it all!)
npm run docker:setup
npm run docker:start

# Visit the application
open http://localhost:3000
```

That's it! 🎉 Your application is now running with all services containerized.

## 🌐 Application URLs

| Service          | URL                                 | Description                |
| ---------------- | ----------------------------------- | -------------------------- |
| **Frontend**     | http://localhost:3000               | Main application interface |
| **Backend API**  | http://localhost:3001/api/v1        | REST API endpoints         |
| **Health Check** | http://localhost:3001/api/v1/health | System health status       |
| **PostgreSQL**   | localhost:5432                      | Database connection        |
| **Redis**        | localhost:6379                      | Cache connection           |

## 🔧 Available Commands

### Main Commands

```bash
npm run docker:setup     # Initial setup and validation
npm run docker:start     # Start all services (production mode)
npm run docker:dev       # Start in development mode (hot reload)
npm run docker:stop      # Stop all services
npm run docker:health    # Check service health
npm run docker:logs      # View all logs
```

### Migration Commands

```bash
npm run docker:migrate run     # Run pending migrations
npm run docker:migrate revert  # Revert last migration
npm run docker:migrate sync    # Sync schema (development)
npm run docker:migrate reset   # Reset database and seed
npm run docker:migrate seed    # Seed sample data
```

### Development Commands

```bash
npm run docker:logs backend    # View backend logs
npm run docker:logs frontend   # View frontend logs
npm run docker:restart         # Restart all services
npm run docker:build          # Build Docker images
npm run docker:clean          # Clean up everything
```

### Direct Access

```bash
npm run docker:exec:backend   # Access backend container
npm run docker:exec:postgres  # Access PostgreSQL CLI
npm run docker:exec:redis     # Access Redis CLI
```

## 🔄 Development Workflow

### Daily Development

```bash
# Start development environment
npm run docker:dev

# Make changes to your code...
# Frontend and backend will auto-reload!

# Check logs if needed
npm run docker:logs

# Stop when done
npm run docker:stop
```

### Database Changes

```bash
# After modifying entities, run migrations
npm run docker:migrate run

# Check migration status
npm run docker:exec:backend
npm run migration:run  # Inside container

# Reset database if needed (careful!)
npm run docker:migrate reset
```

### Adding New Features

```bash
# Start development
npm run docker:dev

# Create new migration (manual)
# Add file to backend/src/database/migrations/

# Run migrations
npm run docker:migrate run

# Test changes...
```

## 🏗️ Project Structure

```
product-catalog/
├── backend/                    # Node.js API Server
│   ├── src/
│   │   ├── modules/products/   # Product module
│   │   ├── database/
│   │   │   ├── migrations/     # Your custom migrations
│   │   │   ├── scripts/        # Migration runner scripts
│   │   │   └── seeds/          # Sample data
│   │   ├── config/            # Configuration files
│   │   └── server.js          # Main server file
│   └── package.json
├── frontend/                   # Vanilla JS Frontend
│   ├── src/
│   ├── index.html
│   └── package.json
├── docker/                     # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── nginx.conf
│   └── postgres-init/
├── scripts/                    # Management scripts
│   ├── setup.sh
│   ├── start.sh
│   ├── migrate.sh
│   └── ...
├── docker-compose.yml
├── .env.example               # Environment template
└── README.md
```

## 🔍 Troubleshooting

### Services Won't Start

```bash
# Check service health
npm run docker:health

# View logs for issues
npm run docker:logs

# Restart services
npm run docker:restart
```

### Port Conflicts

```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001

# Stop conflicting services or change ports in .env
```

### Database Issues

```bash
# Check database logs
npm run docker:logs postgres

# Access database directly
npm run docker:exec:postgres

# Reset database (removes all data!)
npm run docker:migrate reset
```

### Migration Issues

```bash
# Check migration status
npm run docker:exec:backend
npm run migration:run

# View backend logs
npm run docker:logs backend

# Manual migration troubleshooting
npm run docker:exec:backend
# Then debug inside container
```

## 🧹 Cleanup

### Stop Services (Preserve Data)

```bash
npm run docker:stop
```

### Full Cleanup (Removes Everything)

```bash
npm run docker:clean
# Will ask for confirmation before removing data
```

### Manual Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove with data volumes (careful!)
docker-compose down -v
```

## 📊 API Endpoints

### Products API

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| GET    | `/api/v1/products`     | Get products with filters |
| GET    | `/api/v1/products/:id` | Get single product        |
| POST   | `/api/v1/products`     | Create new product        |
| PUT    | `/api/v1/products/:id` | Update product            |
| DELETE | `/api/v1/products/:id` | Delete product            |

### Query Parameters

```bash
# Filter products
GET /api/v1/products?category=Electronics&brand=Apple&min_price=100&max_price=500

# Search products
GET /api/v1/products?search=smartphone&page=1&limit=10

# Sort products
GET /api/v1/products?sort_by=price&sort_order=ASC
```

## 🔐 Security Notes

- **Change default passwords** in `.env` before deployment
- **Use strong passwords**: `openssl rand -base64 32`
- **Don't commit `.env`** to version control
- **Use Docker secrets** in production
- **Regularly update dependencies**

## 🚀 Production Deployment

### Build for Production

```bash
npm run docker:build
npm run docker:start
```

### Environment Configuration

```bash
# Update .env for production
NODE_ENV=production
DB_PASSWORD=<strong-production-password>
REDIS_PASSWORD=<strong-redis-password>
```

## 💡 Pro Tips

- Use `npm run docker:health` to verify all services are working
- Check `npm run docker:logs` for debugging issues
- Development mode has hot reload for both frontend and backend
- Migrations run automatically when starting services
- Use `npm run docker:migrate reset` to start fresh with sample data

## 🆘 Getting Help

1. **Check service health**: `npm run docker:health`
2. **View logs**: `npm run docker:logs [service]`
3. **Access containers**: `npm run docker:exec:[service]`
4. **Reset everything**: `npm run docker:clean && npm run docker:start`

---

**Happy coding!** 🎉

If you encounter any issues, check the troubleshooting section or view the logs for more details.
