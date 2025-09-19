# 🛍️ Product Catalog System

A modern, scalable product catalog application with dynamic filtering capabilities. Built with **Node.js**, **Express**, **TypeORM**, **PostgreSQL**, and **Vanilla JavaScript** - featuring proper entity management, repositories, and migrations.

## 🚀 Features

### Backend API

- **RESTful API** with modular architecture
- **TypeORM Integration** with entities, repositories, and migrations
- **Dynamic Filtering** by category, brand, price range, and search
- **Pagination** with metadata
- **Full-text Search** across product names, descriptions, and brands
- **CRUD Operations** for products
- **Sample Data Generation** for testing
- **PostgreSQL Database** with optimized indexes
- **Database Migrations** for schema management
- **Repository Pattern** for clean data access
- **Joi Validation** with comprehensive input validation

### Frontend

- **Responsive Design** works on all devices
- **Real-time Filtering** with instant results
- **Search Functionality** with debounced input
- **Pagination Controls** for easy navigation
- **Clean UI** with modern styling
- **Sample Data Generator** button

## 🏗️ Project Structure

```
product-catalog/
├── backend/                          # Node.js API Server
│   ├── src/
│   │   ├── modules/
│   │   │   └── products/            # Product Module
│   │   │       ├── controllers/     # HTTP request handlers
│   │   │       ├── services/        # Business logic
│   │   │       ├── repositories/    # Data access layer
│   │   │       ├── entities/        # TypeORM entities
│   │   │       ├── routes/          # Route definitions
│   │   │       └── index.js         # Module exports
│   │   ├── routes/
│   │   │   └── index.js             # Main API routes
│   │   ├── database/
│   │   │   ├── data-source.js       # TypeORM configuration
│   │   │   ├── migrations/          # Database migrations
│   │   │   └── seeds/               # Sample data
│   │   ├── middleware/              # Custom middleware
│   │   ├── utils/                   # Utility functions
│   │   └── server.js                # Main server file
│   ├── package.json
│   └── nodemon.json
├── frontend/                         # Vanilla JS Frontend
│   ├── src/
│   │   ├── main.js                  # Main JavaScript file
│   │   └── style.css                # Styling
│   ├── index.html                   # Main HTML file
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml               # PostgreSQL setup
├── package.json                     # Root package.json
├── .env                            # Environment variables
└── setup.sh                       # Setup script
```

## 📋 Prerequisites

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)

## ⚡ Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone or create the project directory
mkdir product-catalog && cd product-catalog

# Copy all the provided files into the directory structure

# Run the setup script
chmod +x setup.sh
./setup.sh

# Start the application
npm run dev
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Create environment file
cp .env.example .env
# Edit .env and set your database password

# 3. Start PostgreSQL database
docker-compose up -d

# 4. Start the application
npm run dev
```

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=product_catalog
```

⚠️ **Important**: Change `DB_PASSWORD` to a secure password!

## 🚦 Available Scripts

### Root Scripts

```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start only backend (port 3001)
npm run dev:frontend     # Start only frontend (port 3000)
npm run build            # Build both applications
```

### Backend Scripts

```bash
cd backend
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server
npm run migration:run    # Run pending migrations
npm run migration:revert # Revert last migration
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset schema and seed data (development only)
npm test                 # Run tests (when implemented)
```

### Frontend Scripts

```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🌐 Application URLs

| Service               | URL                                 | Description                |
| --------------------- | ----------------------------------- | -------------------------- |
| **Frontend**          | http://localhost:3000               | Main application interface |
| **Backend API**       | http://localhost:3001               | API server                 |
| **API Documentation** | http://localhost:3001/api           | API endpoints overview     |
| **V1 API Base**       | http://localhost:3001/api/v1        | Current API version        |
| **Health Check**      | http://localhost:3001/api/v1/health | Server health status       |
| **Database**          | localhost:5432                      | PostgreSQL database        |

## 📡 API Endpoints & Versioning

### API Versioning Strategy

This API uses **URL-based versioning** with support for multiple versioning methods:

1. **URL Versioning** (Recommended): `/api/v1/products`
2. **Header Versioning**: `API-Version: v1`
3. **Media Type Versioning**: `Accept: application/vnd.productcatalog.v1+json`

#### Current API Version: **v1**

| Version | Status     | Support Until | Notes                              |
| ------- | ---------- | ------------- | ---------------------------------- |
| **v1**  | ✅ Current | Ongoing       | Stable, recommended for production |
| v2      | 🚧 Planned | -             | Advanced features, GraphQL support |

### V1 API Endpoints

| Method     | Endpoint                           | Description                            |
| ---------- | ---------------------------------- | -------------------------------------- |
| **GET**    | `/api/v1/products`                 | Get products with filters & pagination |
| **GET**    | `/api/v1/products/:id`             | Get single product by ID               |
| **POST**   | `/api/v1/products`                 | Create new product                     |
| **PUT**    | `/api/v1/products/:id`             | Update existing product                |
| **DELETE** | `/api/v1/products/:id`             | Delete product (soft delete)           |
| **GET**    | `/api/v1/products/search`          | Search products                        |
| **GET**    | `/api/v1/products/filters/options` | Get filter options                     |
| **POST**   | `/api/v1/products/generate`        | Generate sample data                   |
| **GET**    | `/api/v1/health`                   | API health check                       |

### Query Parameters (GET /api/v1/products)

| Parameter    | Type   | Description                        | Example                 |
| ------------ | ------ | ---------------------------------- | ----------------------- |
| `page`       | number | Page number (default: 1)           | `?page=2`               |
| `limit`      | number | Items per page (default: 20)       | `?limit=10`             |
| `category`   | string | Filter by category                 | `?category=Electronics` |
| `brand`      | string | Filter by brand                    | `?brand=Apple`          |
| `min_price`  | number | Minimum price filter               | `?min_price=100`        |
| `max_price`  | number | Maximum price filter               | `?max_price=500`        |
| `search`     | string | Search in name, description, brand | `?search=smartphone`    |
| `sort_by`    | string | Sort field                         | `?sort_by=price`        |
| `sort_order` | string | Sort direction (ASC/DESC)          | `?sort_order=ASC`       |

### Example API Calls with Versioning

```bash
# Get all products (v1)
curl "http://localhost:3001/api/v1/products"

# Get products with filters (v1)
curl "http://localhost:3001/api/v1/products?category=Electronics&min_price=100&max_price=500&page=1&limit=10"

# Search products (v1)
curl "http://localhost:3001/api/v1/products/search?q=smartphone&page=1"

# Get filter options (v1)
curl "http://localhost:3001/api/v1/products/filters/options"

# Health check (v1)
curl "http://localhost:3001/api/v1/health"
```

#### Generate Sample Data

```bash
# Generate sample data (v1)
curl -X POST "http://localhost:3001/api/v1/products/generate" \
     -H "Content-Type: application/json" \
     -d '{"count": 100}'
```

## 🎯 Getting Started Guide

### 1. First Time Setup

```bash
# After running setup, run migrations and seed data
npm run migration:run
npm run db:seed
```

### 2. Open the Application

- Go to http://localhost:3000
- You should see the product catalog interface
- Use the "Generate Sample Data" button to create test products

### 3. Test the Features

- **Search**: Type in the search box to find products
- **Filter**: Use category and brand dropdowns
- **Price Range**: Set min/max price filters
- **Sort**: Change sorting options
- **Pagination**: Navigate through pages

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Input Validation**: SQL injection prevention
- **Error Handling**: Secure error messages
- **Environment Variables**: Sensitive data protection

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
DB_HOST=your-db-host
DB_PASSWORD=secure-production-password
```

### Build for Production

```bash
# Build both applications
npm run build

# Start production server
cd backend && npm start
```

## 🔮 Future Enhancements

- [ ] API rate limiting
- [ ] Caching with Redis
