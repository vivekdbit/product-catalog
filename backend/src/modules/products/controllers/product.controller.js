import { ProductService } from "../services/product.service.js";
import { productControllerLogger } from "../../../utils/logger/logger.js";

/**
 * Product Controller Class
 *
 * Handles all HTTP requests related to product management.
 * Implements RESTful API patterns with comprehensive error handling,
 * input validation, and structured logging.
 *
 * @class ProductController
 * @description Main controller for product-related HTTP endpoints
 */
export class ProductController {
  constructor() {
    this.logger = productControllerLogger;
    this.productService = new ProductService();
  }

  /**
   * Get Products with Filtering and Pagination
   *
   * Retrieves a paginated list of products with optional filtering capabilities.
   * Supports filtering by category, brand, price range, search terms, and sorting.
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters for filtering
   * @param {number} [req.query.page=1] - Page number for pagination
   * @param {number} [req.query.limit=20] - Number of items per page
   * @param {string} [req.query.category] - Filter by product category
   * @param {string} [req.query.brand] - Filter by product brand
   * @param {number} [req.query.min_price] - Minimum price filter
   * @param {number} [req.query.max_price] - Maximum price filter
   * @param {string} [req.query.search] - Search term for name/description
   * @param {string} [req.query.sort_by="created_at"] - Field to sort by
   * @param {string} [req.query.sort_order="DESC"] - Sort direction (ASC/DESC)
   * @param {boolean} [req.query.is_active=true] - Filter by active status
   *
   * @returns {Promise<void>} JSON response with products and pagination metadata
   *
   * @throws {ValidationError} When query parameters are invalid
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When unexpected error occurs
   */
  getProducts = async (req, res, next) => {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        category: req.query.category,
        brand: req.query.brand,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        search: req.query.search,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order?.toUpperCase(),
        is_active: req.query.is_active,
      };

      const result = await this.productService.getProducts(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.logger.error("Error in getProducts", error);
      next(error);
    }
  };

  /**
   * Get Product by ID
   *
   * Retrieves a single product by its unique identifier.
   * Returns 404 if product is not found or is inactive.
   * @param {Object} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.id - UUID of the product to retrieve
   *
   * @returns {Promise<void>} JSON response with product data
   *
   * @throws {ValidationError} When product ID format is invalid
   * @throws {NotFoundError} When product doesn't exist
   * @throws {DatabaseError} When database operation fails
   */
  getProductById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      this.logger.error("Error in getProductById", error);
      next(error);
    }
  };

  /**
   * Create New Product
   *
   * Creates a new product with the provided data.
   * Validates input data and ensures SKU uniqueness.
   * @param {Object} req - Express request object
   * @param {Object} req.body - Product data to create
   * @param {string} req.body.name - Product name (required, 2-255 chars)
   * @param {string} req.body.description - Product description (optional, max 2000 chars)
   * @param {string} req.body.category - Product category (required, 2-100 chars)
   * @param {string} req.body.brand - Product brand (required, 1-100 chars)
   * @param {number} req.body.price - Product price (required, positive number)
   * @param {number} [req.body.stock_quantity=0] - Initial stock quantity
   * @param {string} req.body.sku - Unique product SKU (required, 3-100 chars)
   * @param {string} [req.body.image_url] - Product image URL (optional)
   * @param {number} [req.body.rating=0] - Product rating (0-5)
   * @param {number} [req.body.review_count=0] - Number of reviews
   * @param {boolean} [req.body.is_active=true] - Active status
   *
   * @returns {Promise<void>} JSON response with created product data
   *
   * @throws {ValidationError} When input data is invalid
   * @throws {BadRequestError} When SKU already exists
   * @throws {DatabaseError} When database operation fails
   */
  createProduct = async (req, res, next) => {
    try {
      const productData = req.body;
      const product = await this.productService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: product,
        message: "Product created successfully",
      });
    } catch (error) {
      this.logger.error("Error in createProduct", error);
      next(error);
    }
  };

  /**
   * Update Existing Product
   *
   * Updates an existing product with provided data.
   * Only provided fields will be updated, others remain unchanged.
   * Validates SKU uniqueness if SKU is being updated.
   *
   * @param {Object} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.id - UUID of product to update
   * @param {Object} req.body - Update data (partial product object)
   *
   * @returns {Promise<void>} JSON response with updated product data
   *
   * @throws {ValidationError} When input data is invalid
   * @throws {NotFoundError} When product doesn't exist
   * @throws {BadRequestError} When SKU conflicts with existing product
   * @throws {DatabaseError} When database operation fails
   */
  updateProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const product = await this.productService.updateProduct(id, updates);

      if (!product) {
        this.logger.warn("Product not found for update in controller", {
          productId: id,
        });

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
        message: "Product updated successfully",
      });
    } catch (error) {
      this.logger.error("Error in updateProduct", error);
      next(error);
    }
  };

  /**
   * Delete Product (Soft Delete)
   *
   * Soft deletes a product by setting is_active to false.
   * The product remains in the database but is hidden from normal queries.
   * This preserves data integrity for historical records and analytics.
   *
   * @param {Object} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.id - UUID of product to delete
   *
   * @returns {Promise<void>} JSON response confirming deletion
   *
   * @throws {ValidationError} When product ID format is invalid
   * @throws {NotFoundError} When product doesn't exist
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When deletion operation fails
   */
  deleteProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await this.productService.deleteProduct(id);

      if (!deleted) {
        this.logger.warn("Product not found for deletion in controller", {
          productId: id,
        });

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      this.logger.error("Error in deleteProduct", error);
      next(error);
    }
  };

  /**
   * Get Filter Options
   *
   * Retrieves available filter options for products including:
   * - Available categories
   * - Available brands
   * - Price range (min/max)
   *
   * Used by frontend to populate filter dropdowns and components.
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} JSON response with filter options
   */
  getFilterOptions = async (req, res, next) => {
    try {
      const options = await this.productService.getFilterOptions();

      res.json({
        success: true,
        data: options,
      });
    } catch (error) {
      this.logger.error("Error in getFilterOptions", error);
      next(error);
    }
  };

  /**
   * Generate Sample Data
   *
   * Generates sample products for testing and development purposes.
   * Creates products with randomized but realistic data using predefined
   * categories, brands, and adjectives from constants.
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {number} [req.body.count=10] - Number of sample products to generate (1-1000)
   *
   * @returns {Promise<void>} JSON response with generation results
   *
   * @throws {ValidationError} When count parameter is invalid
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When generation fails
   */
  generateSampleData = async (req, res, next) => {
    try {
      const { count = 1000 } = req.body;
      const result = await this.productService.generateSampleData({ count });

      res.json({
        success: true,
        message: `Generated ${count} sample products`,
        data: result,
      });
    } catch (error) {
      this.logger.error("Error in generateSampleData", error);
      next(error);
    }
  };

  /**
   * Search Products
   *
   * Performs text-based search across product names, descriptions, and brands.
   * Supports the same filtering and pagination options as getProducts.
   * Minimum search query length is 2 characters.
   *
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.q - Search query string (minimum 2 characters)
   * @param {number} [req.query.page=1] - Page number for pagination
   * @param {number} [req.query.limit=20] - Number of items per page
   * @param {string} [req.query.sort_by="created_at"] - Field to sort by
   * @param {string} [req.query.sort_order="DESC"] - Sort direction
   *
   * @returns {Promise<void>} JSON response with search results and pagination
   *
   * @throws {BadRequestError} When search query is too short or missing
   * @throws {ValidationError} When query parameters are invalid
   * @throws {DatabaseError} When database operation fails
   */
  searchProducts = async (req, res, next) => {
    try {
      const { q: query } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Search query must be at least 2 characters long",
        });
      }

      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: query.trim(),
        sort_by: req.query.sort_by || "created_at",
        sort_order: req.query.sort_order || "DESC",
      };

      const result = await this.productService.getProducts(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.logger.error("Error in searchProducts", error);
      next(error);
    }
  };
}
