import { AppDataSource } from "../../../database/data-source.js";
import { Product, ProductModel } from "../entities/Product.js";
import { DatabaseError } from "../../../errors/index.js";
import { databaseLogger } from "../../../utils/logger/logger.js";

/**
 * Product Repository Class
 *
 * Handles all database operations for products using TypeORM.
 * Provides abstraction layer between business logic and database,
 * with automatic model conversion and connection management.
 *
 * @class ProductRepository
 * @description Data access layer for product operations
 */
export class ProductRepository {
  constructor() {
    this.repository = null;
    this.logger = databaseLogger;
  }

  /**
   * Initialize TypeORM Repository
   */
  async initialize() {
    try {
      if (!this.repository) {
        this.repository = AppDataSource.getRepository(Product);
      }
      return this.repository;
    } catch (error) {
      this.logger.error("Failed to initialize repository", error);
      throw new DatabaseError("Repository initialization failed", {
        operation: "initialize",
        originalError: error.message,
      });
    }
  }

  /**
   * Get TypeORM Repository Instance
   */
  async getRepository() {
    try {
      if (!this.repository) {
        await this.initialize();
      }
      return this.repository;
    } catch (error) {
      this.logger.error("Failed to get repository instance", error);
      throw new DatabaseError("Repository access failed", {
        operation: "getRepository",
        originalError: error.message,
      });
    }
  }

  /**
   * Convert Database Entity to Business Model
   */
  _toProductModel(data) {
    try {
      return data ? new ProductModel(data) : null;
    } catch (error) {
      this.logger.error("Failed to convert entity to model", error);
      throw new DatabaseError("Model conversion failed", {
        operation: "toProductModel",
        originalError: error.message,
      });
    }
  }

  /**
   * Convert Database Entities Array to Business Models
   */
  _toProductModels(dataArray) {
    try {
      return dataArray.map((data) => this._toProductModel(data));
    } catch (error) {
      this.logger.error("Failed to convert entities array to models", error);
      throw new DatabaseError("Bulk model conversion failed", {
        operation: "toProductModels",
        originalError: error.message,
      });
    }
  }

  /**
   * Find Products with Advanced Filtering and Pagination
   */
  async findWithFilters(filters = {}) {
    try {
      const repo = await this.getRepository();
      const {
        page = 1,
        limit = 20,
        category,
        brand,
        min_price,
        max_price,
        search,
        sort_by = "created_at",
        sort_order = "DESC",
        is_active = true,
      } = filters;

      // Build query
      const queryBuilder = repo
        .createQueryBuilder("product")
        .where("product.is_active = :is_active", { is_active });

      // Apply filters
      if (category) {
        queryBuilder.andWhere("product.category = :category", { category });
      }

      if (brand) {
        queryBuilder.andWhere("product.brand = :brand", { brand });
      }

      if (min_price !== undefined && min_price !== null) {
        queryBuilder.andWhere("product.price >= :min_price", { min_price });
      }

      if (max_price !== undefined && max_price !== null) {
        queryBuilder.andWhere("product.price <= :max_price", { max_price });
      }

      if (search) {
        queryBuilder.andWhere(
          "(product.name ILIKE :search OR product.description ILIKE :search OR product.brand ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      const allowedSortFields = [
        "name",
        "price",
        "rating",
        "created_at",
        "category",
        "brand",
        "stock_quantity",
      ];
      const sortField = allowedSortFields.includes(sort_by)
        ? sort_by
        : "created_at";
      const sortDirection = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      queryBuilder.orderBy(`product.${sortField}`, sortDirection);

      // Add secondary sort by id for consistent pagination
      if (sortField !== "id") {
        queryBuilder.addOrderBy("product.id", "ASC");
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      // Execute query
      const [products, total] = await queryBuilder.getManyAndCount();

      // Build pagination metadata
      const totalPages = Math.ceil(total / limit);
      const pagination = {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
      };

      // Return converted models with pagination
      return {
        products: this._toProductModels(products),
        pagination,
      };
    } catch (error) {
      this._handleDatabaseError(error, "findWithFilters", { filters });
    }
  }

  /**
   * Find Product by ID
   */
  async findById(id) {
    try {
      const repo = await this.getRepository();
      const product = await repo.findOne({
        where: { id, is_active: true },
      });

      return this._toProductModel(product);
    } catch (error) {
      this._handleDatabaseError(error, "findById", { productId: id });
    }
  }

  /**
   * Create New Product
   */
  async create(productData) {
    try {
      const repo = await this.getRepository();

      // Create entity instance with provided data
      const product = repo.create(productData);

      // Save to database
      const savedProduct = await repo.save(product);

      return this._toProductModel(savedProduct);
    } catch (error) {
      this._handleDatabaseError(error, "create", {
        sku: productData?.sku,
        name: productData?.name,
      });
    }
  }

  /**
   * Update Existing Product
   */
  async update(id, updateData) {
    try {
      const repo = await this.getRepository();

      // First check if product exists
      const existingProduct = await this.findById(id);
      if (!existingProduct) {
        return null;
      }

      // Update the product
      await repo.update(id, updateData);

      // Return updated product
      return this.findById(id);
    } catch (error) {
      this._handleDatabaseError(error, "update", {
        productId: id,
        updateFields: Object.keys(updateData),
      });
    }
  }

  /**
   * Soft Delete Product
   */
  async softDelete(id) {
    try {
      const repo = await this.getRepository();

      // Update product to inactive status with current timestamp
      const result = await repo.update(id, {
        is_active: false,
        updated_at: new Date(),
      });

      // Return success status based on affected rows
      return result.affected > 0;
    } catch (error) {
      this._handleDatabaseError(error, "softDelete", { productId: id });
    }
  }

  /**
   * Get Filter Options
   */
  async getFilterOptions() {
    try {
      const repo = await this.getRepository();

      // Execute three queries in parallel for efficiency
      const [categories, brands, priceRange] = await Promise.all([
        // Get distinct categories sorted alphabetically
        repo
          .createQueryBuilder("product")
          .select("DISTINCT product.category", "category")
          .where("product.is_active = :is_active", { is_active: true })
          .orderBy("product.category", "ASC")
          .getRawMany(),

        // Get distinct brands sorted alphabetically
        repo
          .createQueryBuilder("product")
          .select("DISTINCT product.brand", "brand")
          .where("product.is_active = :is_active", { is_active: true })
          .orderBy("product.brand", "ASC")
          .getRawMany(),

        // Get price range (min and max values)
        repo
          .createQueryBuilder("product")
          .select("MIN(product.price)", "min_price")
          .addSelect("MAX(product.price)", "max_price")
          .where("product.is_active = :is_active", { is_active: true })
          .getRawOne(),
      ]);

      // Format and return filter options
      return {
        categories: categories.map((item) => item.category),
        brands: brands.map((item) => item.brand),
        price_range: {
          min_price: parseFloat(priceRange?.min_price || 0),
          max_price: parseFloat(priceRange?.max_price || 1000),
        },
      };
    } catch (error) {
      this._handleDatabaseError(error, "getFilterOptions");
    }
  }

  /**
   * Bulk Create Products
   */
  async bulkCreate(productsData) {
    try {
      const repo = await this.getRepository();

      // Create entity instances from provided data
      const products = repo.create(productsData);

      // Save in chunks of 50 for optimal performance
      const savedProducts = await repo.save(products, { chunk: 50 });

      // Convert to ProductModel instances
      return this._toProductModels(savedProducts);
    } catch (error) {
      this._handleDatabaseError(error, "bulkCreate", {
        count: productsData.length,
      });
    }
  }

  /**
   * Check SKU Existence
   */
  async isSkuExists(sku, excludeId = null) {
    try {
      const repo = await this.getRepository();

      // Build query to check SKU existence
      const queryBuilder = repo
        .createQueryBuilder("product")
        .where("product.sku = :sku", { sku });

      // Exclude specific product ID if provided (for update operations)
      if (excludeId) {
        queryBuilder.andWhere("product.id != :excludeId", { excludeId });
      }

      // Get count and return boolean
      const count = await queryBuilder.getCount();
      return count > 0;
    } catch (error) {
      this._handleDatabaseError(error, "isSkuExists", { sku, excludeId });
    }
  }

  /**
   * Handle Database Errors with Context
   */
  _handleDatabaseError(error, operation, context = {}) {
    this.logger.error(`Database operation failed: ${operation}`, error, {
      operation,
      context,
      errorCode: error.code || "UNKNOWN",
    });

    const errorCode = error.code;
    const errorMessage = error.message || "";

    // Connection errors
    if (
      error.name === "ConnectionNotFoundError" ||
      error.name === "CannotConnectToDatabase" ||
      errorCode === "ECONNREFUSED" ||
      errorCode === "ENOTFOUND"
    ) {
      throw new DatabaseError("Database connection failed", {
        operation,
        context,
        originalError: errorMessage,
        errorCode,
      });
    }

    // Constraint violation errors
    if (errorCode === "23505") {
      // Unique violation
      throw new DatabaseError("Unique constraint violation", {
        operation,
        context,
        constraint: "unique",
        originalError: errorMessage,
        errorCode,
      });
    }

    if (errorCode === "23503") {
      // Foreign key violation
      throw new DatabaseError("Foreign key constraint violation", {
        operation,
        context,
        constraint: "foreign_key",
        originalError: errorMessage,
        errorCode,
      });
    }

    if (errorCode === "23502") {
      // Not null violation
      throw new DatabaseError("Not null constraint violation", {
        operation,
        context,
        constraint: "not_null",
        originalError: errorMessage,
        errorCode,
      });
    }

    // Generic database error
    throw new DatabaseError(`Database operation failed: ${operation}`, {
      operation,
      context,
      originalError: errorMessage,
      errorCode: errorCode || "UNKNOWN",
    });
  }
}
