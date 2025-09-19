import { AppDataSource } from "../data-source.js";

async function revertMigration() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    console.log("🔄 Reverting last migration...");
    await AppDataSource.undoLastMigration({
      transaction: "each",
    });

    console.log("✅ Successfully reverted last migration");

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration revert failed:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

revertMigration();
