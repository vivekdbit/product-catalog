import { Router } from "express";
import { productRoutes } from "../modules/products/index.js";

const router = Router();

// API version info
router.get("/v1/", (req, res) => {
  res.json({
    message: "Product Catalog API",
    version: "1.0.0",
    status: "OK",
    api_versions: {
      current: "v1",
      supported: ["v1"],
      deprecated: [],
      sunset: [],
    },
    modules: ["products"],
    endpoints: {
      v1: {
        products: "/api/v1/products",
        health: "/api/v1/health",
      },
    },
    documentation:
      "https://github.com/your-repo/product-catalog#api-documentation",
  });
});

// Version-specific health check
router.get("/v1/health", (req, res) => {
  res.json({
    status: "OK",
    version: "1.0.0",
    api_version: "v1",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  });
});

// V1 API Routes
router.use("/v1/products", productRoutes);

// Future versions can be added here:
// router.use('/v2/products', productRoutesV2);
// router.use('/v3/products', productRoutesV3);

export default router;
