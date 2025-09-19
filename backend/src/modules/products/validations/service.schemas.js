import Joi from "joi";

export const serviceValidationSchemas = {
  // Validate product creation data at service level
  createProduct: Joi.object({
    name: Joi.string().trim().min(2).max(255).required().messages({
      "string.empty": "Product name is required",
      "string.min": "Product name must be at least 2 characters long",
      "string.max": "Product name cannot exceed 255 characters",
    }),

    description: Joi.string().trim().max(2000).allow("").optional(),

    category: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Category is required",
      "string.min": "Category must be at least 2 characters long",
    }),

    brand: Joi.string().trim().min(1).max(100).required().messages({
      "string.empty": "Brand is required",
    }),

    price: Joi.number()
      .positive()
      .precision(2)
      .max(999999.99)
      .required()
      .messages({
        "number.base": "Price must be a valid number",
        "number.positive": "Price must be greater than 0",
        "any.required": "Price is required",
      }),

    stock_quantity: Joi.number().integer().min(0).default(0),

    sku: Joi.string().trim().min(3).max(100).required().messages({
      "string.empty": "SKU is required",
      "string.min": "SKU must be at least 3 characters long",
    }),

    image_url: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .max(500)
      .allow("")
      .optional(),

    rating: Joi.number().min(0).max(5).precision(2).default(0),

    review_count: Joi.number().integer().min(0).default(0),

    is_active: Joi.boolean().default(true),
  }),

  // Validate product update data
  updateProduct: Joi.object({
    name: Joi.string().trim().min(2).max(255).optional(),

    description: Joi.string().trim().max(2000).allow("").optional(),

    category: Joi.string().trim().min(2).max(100).optional(),

    brand: Joi.string().trim().min(1).max(100).optional(),

    price: Joi.number().positive().precision(2).max(999999.99).optional(),

    stock_quantity: Joi.number().integer().min(0).optional(),

    sku: Joi.string().trim().min(3).max(100).optional(),

    image_url: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .max(500)
      .allow("")
      .optional(),

    rating: Joi.number().min(0).max(5).precision(2).optional(),

    review_count: Joi.number().integer().min(0).optional(),

    is_active: Joi.boolean().optional(),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),

  // Validate ID parameter
  productId: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.empty": "Product ID is required",
    "string.uuid": "Product ID must be a valid UUID",
  }),

  // Validate sample data generation
  generateSampleData: Joi.object({
    count: Joi.number().integer().min(1).max(1000).default(1000).messages({
      "number.min": "Count must be at least 1",
      "number.max": "Count cannot exceed 1000",
    }),
  }),

  // Validate filter parameters
  filterParams: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string().trim().max(100).optional(),
    brand: Joi.string().trim().max(100).optional(),
    min_price: Joi.number().min(0).precision(2).optional(),
    max_price: Joi.number().min(0).precision(2).optional(),
    search: Joi.string().trim().min(1).max(255).optional(),
    sort_by: Joi.string()
      .valid(
        "name",
        "price",
        "rating",
        "created_at",
        "category",
        "brand",
        "stock_quantity"
      )
      .default("created_at"),
    sort_order: Joi.string()
      .valid("ASC", "DESC", "asc", "desc")
      .default("DESC"),
    is_active: Joi.boolean().default(true),
  }),

  // Validate search parameters
  searchParams: Joi.object({
    searchTerm: Joi.string().trim().min(2).max(255).required().messages({
      "string.empty": "Search term is required",
      "string.min": "Search term must be at least 2 characters long",
    }),
    filters: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort_by: Joi.string()
        .valid("name", "price", "rating", "created_at", "category", "brand")
        .default("created_at"),
      sort_order: Joi.string()
        .valid("ASC", "DESC", "asc", "desc")
        .default("DESC"),
    }).default({}),
  }),

  // Validate threshold for low stock
  lowStockThreshold: Joi.number().integer().min(0).max(1000).default(10),

  // Validate limit for top rated
  topRatedLimit: Joi.number().integer().min(1).max(100).default(10),

  // Validate category/brand parameters
  categoryBrandParams: Joi.object({
    value: Joi.string().trim().min(1).max(100).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
