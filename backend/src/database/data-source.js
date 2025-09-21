import { DataSource } from "typeorm";
import { Product } from "../modules/products/entities/Product.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../../.env") });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "product_catalog",
  synchronize: false, // Never use in production
  logging:
    process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  entities: [Product],
  migrations: ["src/database/migrations/*.js"],
  subscribers: ["src/database/subscribers/*.js"],
  migrationsTableName: "migrations_history",
  // SSL Configuration
  ssl:
    process.env.NODE_ENV === "production" && process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
  // Connection pool settings
  extra: {
    max: 20, // Maximum number of connections
    min: 5, // Minimum number of connections
    acquire: 30000, // Maximum time to get connection
    idle: 10000, // Maximum time connection can be idle
  },
  dropSchema: false,
  cache: false,
});

// Initialize the data source
export async function initializeDataSource() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ TypeORM Data Source has been initialized");
    }
    return AppDataSource;
  } catch (error) {
    console.error("❌ Error during Data Source initialization:", error);
    throw error;
  }
}

// Close the data source
export async function closeDataSource() {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✅ TypeORM Data Source has been closed");
    }
  } catch (error) {
    console.error("❌ Error during Data Source closure:", error);
    throw error;
  }
}
