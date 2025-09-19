import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";

const router = Router();
const productController = new ProductController();

// Base routes for products
router.get("/", productController.getProducts);
router.post("/", productController.createProduct);

// Search route (before :id route to avoid conflicts)
router.get("/search", productController.searchProducts);

// Filter options route
router.get("/filters/options", productController.getFilterOptions);

// Generate sample data route
router.post("/generate", productController.generateSampleData);

// Individual product routes
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
