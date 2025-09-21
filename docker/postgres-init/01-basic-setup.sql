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
