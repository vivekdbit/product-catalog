import { AppDataSource } from "../data-source.js";

async function syncSchema() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("🔄 Synchronizing database schema...");
    console.log(
      "⚠️  WARNING: This will drop and recreate tables! Only use in development!"
    );

    if (process.env.NODE_ENV === "production") {
      console.error("❌ Schema sync is not allowed in production environment");
      process.exit(1);
    }

    // Synchronize schema (dangerous - only for development)
    await AppDataSource.synchronize(true); // true = drop schema first

    console.log("✅ Database schema synchronized successfully");

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Schema sync failed:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Add confirmation prompt
if (process.argv.includes("--force")) {
  syncSchema();
} else {
  console.log("⚠️  This operation will DROP ALL TABLES and recreate them!");
  console.log("To proceed, run: npm run schema:sync --force");
  console.log("For production, use migrations instead: npm run migration:run");
}
