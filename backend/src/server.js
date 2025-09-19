import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import apiRoutes from "./routes/index.js";
import { initializeDataSource } from "./database/data-source.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || "v1";

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.path} - API Version: ${
        req.headers["api-version"] || "default"
      }`
    );
    next();
  });
}

// API routes
app.use("/api", apiRoutes);

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDataSource();
    console.log("✅ Database connected and tables created");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
      console.log(`🔄 Current API Version: ${API_VERSION}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
}

startServer();
