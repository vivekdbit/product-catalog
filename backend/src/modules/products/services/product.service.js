import { ProductRepository } from "../repositories/ProductRepository.js";
import { serviceValidationSchemas } from "../validations/service.schemas.js";
import {
  ValidationError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
  InternalServerError,
  BaseError,
} from "../../../errors/index.js";
import { productLogger } from "../../../utils/logger/logger.js";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_BRANDS,
  PRODUCT_ADJECTIVES,
  PRODUCT_DEFAULTS,
} from "../constants/product.constants.js";

/**
 * Product Service Class
 *
 * Handles all business logic related to product management operations.
 * Implements comprehensive validation, error handling, and logging.
 * Coordinates between controller and repository layers while enforcing business rules.
 *
 * @class ProductService
 * @description Business logic layer for product operations
 */
export class ProductService {
  constructor() {
    this.logger = productLogger;
    this.productRepository = new ProductRepository();
  }

  /**
   * Get Products with Filtering and Pagination
   *
   * Retrieves products with comprehensive filtering, sorting, and pagination support.
   * Validates input parameters and applies business rules for data access.
   * @param {Object} [filters={}] - Filter parameters
   * @param {number} [filters.page=1] - Page number for pagination
   * @param {number} [filters.limit=20] - Items per page
   * @param {string} [filters.category] - Filter by category
   * @param {string} [filters.brand] - Filter by brand
   * @param {number} [filters.min_price] - Minimum price filter
   * @param {number} [filters.max_price] - Maximum price filter
   * @param {string} [filters.search] - Search term
   * @param {string} [filters.sort_by] - Sort field
   * @param {string} [filters.sort_order] - Sort direction
   * @param {boolean} [filters.is_active=true] - Filter by active status
   *
   * @returns {Promise<Object>} Products and pagination metadata
   * @returns {Array} return.products - Array of product objects
   * @returns {Object} return.pagination - Pagination information
   *
   * @throws {ValidationError} When filter parameters are invalid
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When unexpected error occurs
   */
  async getProducts(filters) {
    try {
      // Validate filter parameters
      const { error, value: validatedFilters } =
        serviceValidationSchemas.filterParams.validate(filters, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true,
        });
      if (error) {
        throw new ValidationError("Validation failed");
      }

      const result = await this.productRepository.findWithFilters(
        validatedFilters
      );
      // Convert products to JSON format
      return {
        products: result.products.map((p) => p.toJSON()),
        pagination: result.pagination,
      };
    } catch (error) {
      this.logger.error("Error in retrieve products", error);

      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Error in retrieve products");
    }
  }

  /**
   * Get Product by ID
   *
   * Retrieves a single product by its unique identifier.
   * Validates the ID format and ensures the product exists and is active.
   *
   * @param {string} id - UUID of the product to retrieve
   *
   * @returns {Promise<Object|null>} Product data or null if not found
   *
   * @throws {ValidationError} When ID format is invalid
   * @throws {NotFoundError} When product doesn't exist
   * @throws {DatabaseError} When database operation fails
   */
  async getProductById(id) {
    try {
      // Validate product ID
      const { value: validatedId } = this._validateData(
        { id },
        { id: serviceValidationSchemas.productId }
      );

      const product = await this.productRepository.findById(validatedId.id);
      if (!product) {
        this.logger.warn("Product not found", {
          productId: validatedId.id,
        });
        throw new NotFoundError("Product not found");
      }

      return product.toJSON();
    } catch (error) {
      this.logger.error("Error getting product by ID", error);

      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Error getting product by ID");
    }
  }

  /**
   * Create New Product
   *
   * Creates a new product with comprehensive validation and business rule enforcement.
   * Ensures SKU uniqueness and applies default values where appropriate.
   * @param {Object} productData - Product data to create
   * @param {string} productData.name - Product name (required, 2-255 chars)
   * @param {string} [productData.description] - Product description (max 2000 chars)
   * @param {string} productData.category - Product category (required, 2-100 chars)
   * @param {string} productData.brand - Product brand (required, 1-100 chars)
   * @param {number} productData.price - Product price (required, positive)
   * @param {number} [productData.stock_quantity=0] - Initial stock quantity
   * @param {string} productData.sku - Unique product SKU (required, 3-100 chars)
   * @param {string} [productData.image_url] - Product image URL
   * @param {number} [productData.rating=0] - Product rating (0-5)
   * @param {number} [productData.review_count=0] - Number of reviews
   * @param {boolean} [productData.is_active=true] - Active status
   *
   * @returns {Promise<Object>} Created product data
   *
   * @throws {ValidationError} When input data is invalid
   * @throws {BadRequestError} When SKU already exists
   * @throws {DatabaseError} When database operation fails
   */
  async createProduct(productData) {
    try {
      // Validate product data
      const validatedData = this._validateData(
        productData,
        serviceValidationSchemas.createProduct
      );

      // Check if SKU already exists
      const existingSku = await this.productRepository.isSkuExists(
        validatedData.sku
      );
      if (existingSku) {
        this.logger.warn("SKU already exists", {
          sku: validatedData.sku,
        });
        throw new BadRequestError("SKU already exists");
      }

      const product = await this.productRepository.create(validatedData);

      this.logger.info("Product created successfully", {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
      });

      return product.toJSON();
    } catch (error) {
      this.logger.error("Error creating product", error);

      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Error creating product");
    }
  }

  /**
   * Update Existing Product
   *
   * Updates an existing product with partial data.
   * Validates input, ensures product exists, and maintains SKU uniqueness.
   *
   * @returns {Promise<Object|null>} Updated product data or null if not found
   *
   * @throws {ValidationError} When input data is invalid
   * @throws {NotFoundError} When product doesn't exist
   * @throws {BadRequestError} When SKU conflicts with existing product
   * @throws {DatabaseError} When database operation fails
   */
  async updateProduct(id, updateData) {
    try {
      // Validate product ID and update data
      const { value: validatedId } = this._validateData(
        { id },
        { id: serviceValidationSchemas.productId }
      );
      const validatedData = this._validateData(
        updateData,
        serviceValidationSchemas.updateProduct
      );

      // Check if product exists
      const existingProduct = await this.productRepository.findById(
        validatedId.id
      );
      if (!existingProduct) {
        this.logger.warn("Product not found for update", {
          productId: validatedId.id,
        });
        throw new NotFoundError("Product not found", {
          productId: validatedId.id,
        });
      }

      // If updating SKU, check uniqueness
      if (validatedData.sku) {
        this.logger.debug("Checking SKU uniqueness for update", {
          newSku: validatedData.sku,
          productId: validatedId.id,
        });

        const skuExists = await this.productRepository.isSkuExists(
          validatedData.sku,
          validatedId.id
        );
        if (skuExists) {
          this.logger.warn("SKU already exists for another product", {
            sku: validatedData.sku,
            productId: validatedId.id,
          });
          throw new BadRequestError("SKU already exists for another product");
        }
      }

      // Update the product
      const product = await this.productRepository.update(
        validatedId.id,
        validatedData
      );

      return product.toJSON();
    } catch (error) {
      this.logger.error("Error updating product", error);

      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Error updating product");
    }
  }

  /**
   * Delete Product (Soft Delete)
   *
   * Performs soft deletion by setting is_active to false.
   * Preserves data integrity for historical records and analytics.
   * @param {string} id - UUID of product to delete
   *
   * @returns {Promise<Object>} Deletion confirmation
   * @returns {boolean} return.success - Whether deletion was successful
   * @returns {string} return.message - Confirmation message
   *
   * @throws {ValidationError} When ID format is invalid
   * @throws {NotFoundError} When product doesn't exist
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When deletion operation fails
   */
  async deleteProduct(id) {
    try {
      // Validate product ID
      const { value: validatedId } = this._validateData(
        { id },
        { id: serviceValidationSchemas.productId }
      );

      // Check if product exists
      const existingProduct = await this.productRepository.findById(
        validatedId.id
      );
      if (!existingProduct) {
        this.logger.warn("Product not found for deletion", {
          productId: validatedId.id,
        });
        throw new NotFoundError("Product not found");
      }

      const result = await this.productRepository.softDelete(validatedId.id);
      if (!result) {
        this.logger.error("Failed to delete product", {
          productId: validatedId.id,
        });
        throw new InternalServerError("Failed to delete product");
      }

      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      this.logger.error("Failed to delete product", error);

      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Failed to delete product");
    }
  }

  /**
   * Get Filter Options
   *
   * Retrieves available filter options for products including
   * categories, brands, and price ranges from existing data.
   * @returns {Promise<Object>} Available filter options
   * @returns {Array<string>} return.categories - Available categories
   * @returns {Array<string>} return.brands - Available brands
   * @returns {Object} return.price_range - Price range information
   * @returns {number} return.price_range.min_price - Minimum price
   * @returns {number} return.price_range.max_price - Maximum price
   *
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When unexpected error occurs
   */
  async getFilterOptions() {
    try {
      return await this.productRepository.getFilterOptions();
    } catch (error) {
      this.logger.error("Error getting filter options", error);

      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Error getting filter options");
    }
  }

  /**
   * Generate Sample Data
   *
   * Generates sample products for testing and development purposes.
   * Creates realistic product data using predefined constants for
   * categories, brands, and adjectives with randomized attributes.
   * @param {Object} [params={}] - Generation parameters
   * @param {number} [params.count=10] - Number of products to generate (1-1000)
   *
   * @returns {Promise<Object>} Generation results
   * @returns {number} return.requested - Number of products requested
   * @returns {number} return.created - Number of products actually created
   * @returns {Array} return.products - Array of created product objects
   *
   * @throws {ValidationError} When parameters are invalid
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When generation fails
   */
  async generateSampleData(params = {}) {
    try {
      // Validate input parameters
      const validatedParams = this._validateData(
        params,
        serviceValidationSchemas.generateSampleData
      );
      const { count } = validatedParams;

      this.logger.info("Starting sample data generation using constants", {
        count,
        categoriesAvailable: PRODUCT_CATEGORIES.length,
        brandsAvailable: PRODUCT_BRANDS.length,
        adjectivesAvailable: PRODUCT_ADJECTIVES.length,
      });

      const products = [];
      const timestamp = Date.now();

      for (let i = 1; i <= count; i++) {
        // Randomly select category, brand, and adjective
        const category =
          PRODUCT_CATEGORIES[
            Math.floor(Math.random() * PRODUCT_CATEGORIES.length)
          ];
        const brand =
          PRODUCT_BRANDS[Math.floor(Math.random() * PRODUCT_BRANDS.length)];
        const adjective =
          PRODUCT_ADJECTIVES[
            Math.floor(Math.random() * PRODUCT_ADJECTIVES.length)
          ];

        const product = {
          name: `${adjective} ${brand} ${category} ${i}`,
          description: `High-quality ${category.toLowerCase()} from ${brand}. Perfect for your daily needs with advanced features and reliable performance.`,
          category,
          brand,
          price:
            Math.round(
              (Math.random() *
                (PRODUCT_DEFAULTS.MAX_PRICE - PRODUCT_DEFAULTS.MIN_PRICE) +
                PRODUCT_DEFAULTS.MIN_PRICE) *
                100
            ) / 100,
          stock_quantity:
            Math.floor(Math.random() * PRODUCT_DEFAULTS.MAX_STOCK_QUANTITY) + 1,
          sku: `SKU-${brand.toUpperCase()}-${category
            .replace(/[^A-Z]/gi, "")
            .toUpperCase()}-${timestamp}-${i.toString().padStart(3, "0")}`,
          image_url: `https://picsum.photos/400/400?random=${timestamp + i}`,
          rating:
            Math.round(
              (Math.random() *
                (PRODUCT_DEFAULTS.MAX_RATING - PRODUCT_DEFAULTS.MIN_RATING) +
                PRODUCT_DEFAULTS.MIN_RATING) *
                100
            ) / 100,
          review_count:
            Math.floor(Math.random() * PRODUCT_DEFAULTS.MAX_REVIEW_COUNT) + 1,
          is_active: PRODUCT_DEFAULTS.IS_ACTIVE,
        };

        products.push(product);
      }

      const savedProducts = await this.productRepository.bulkCreate(products);
      this.logger.info(`Sample data generation completed - ${products.length}`);

      return {
        requested: count,
        created: savedProducts.length,
        products: savedProducts.map((p) => p.toJSON()),
      };
    } catch (error) {
      this.logger.error("Error generating sample data", error);
      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Error generating sample data");
    }
  }

  /**
   * Search Products with Advanced Options
   *
   * Performs full-text search across product names, descriptions, and brands
   * with support for additional filtering and pagination options.
   * @param {string} searchTerm - Search query string (minimum 2 characters)
   * @param {Object} [filters={}] - Additional filter options
   * @param {number} [filters.page=1] - Page number for pagination
   * @param {number} [filters.limit=20] - Number of items per page
   * @param {string} [filters.sort_by="created_at"] - Field to sort by
   * @param {string} [filters.sort_order="DESC"] - Sort direction
   *
   * @returns {Promise<Object>} Search results and pagination metadata
   * @returns {Array} return.products - Array of matching products
   * @returns {Object} return.pagination - Pagination information
   *
   * @throws {ValidationError} When search parameters are invalid
   * @throws {DatabaseError} When database operation fails
   * @throws {InternalServerError} When unexpected error occurs
   */
  async searchProducts(searchTerm, filters = {}) {
    try {
      // Validate search parameters
      const validatedParams = this._validateData(
        { searchTerm, filters },
        serviceValidationSchemas.searchParams
      );

      const result = await this.productRepository.findWithFilters({
        search: validatedParams.searchTerm,
        ...validatedParams.filters,
      });

      return {
        products: result.products.map((p) => p.toJSON()),
        pagination: result.pagination,
      };
    } catch (error) {
      this.logger.error("Error searching products", error);
      if (error instanceof BaseError) throw error;
      throw new InternalServerError("Error searching products");
    }
  }

  /**
   * Validates data using Joi schema
   *
   * Performs comprehensive input validation using predefined Joi schemas.
   * Provides detailed error messages for validation failures and logs
   * validation attempts for debugging and monitoring.
   */
  _validateData(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      throw new ValidationError("Validation failed", {
        details: errorDetails,
        originalError: error.message,
      });
    }

    return value;
  }
}
