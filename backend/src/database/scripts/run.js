import { AppDataSource } from "../data-source.js";

async function runMigrations() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("🔄 Running pending migrations...");
    const migrations = await AppDataSource.runMigrations({
      transaction: "each", // Run each migration in its own transaction
    });

    if (migrations.length === 0) {
      console.log("✅ No pending migrations found");
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

runMigrations();
