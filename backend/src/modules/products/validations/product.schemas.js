import Joi from "joi";

// Base product schema for common validations
const baseProductSchema = {
  name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .pattern(/^[a-zA-Z0-9\s\-\_\.\,\&\(\)]+$/)
    .messages({
      "string.empty": "Product name is required",
      "string.min": "Product name must be at least 2 characters long",
      "string.max": "Product name cannot exceed 255 characters",
      "string.pattern.base": "Product name contains invalid characters",
    }),

  description: Joi.string().trim().max(2000).allow("").optional().messages({
    "string.max": "Description cannot exceed 2000 characters",
  }),

  category: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\_\&]+$/)
    .messages({
      "string.empty": "Category is required",
      "string.min": "Category must be at least 2 characters long",
      "string.max": "Category cannot exceed 100 characters",
      "string.pattern.base": "Category contains invalid characters",
    }),

  brand: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\_\.\&]+$/)
    .messages({
      "string.empty": "Brand is required",
      "string.min": "Brand must be at least 1 character long",
      "string.max": "Brand cannot exceed 100 characters",
      "string.pattern.base": "Brand contains invalid characters",
    }),

  price: Joi.number().positive().precision(2).max(999999.99).messages({
    "number.base": "Price must be a valid number",
    "number.positive": "Price must be greater than 0",
    "number.precision": "Price can have at most 2 decimal places",
    "number.max": "Price cannot exceed $999,999.99",
  }),

  stock_quantity: Joi.number().integer().min(0).max(999999).messages({
    "number.base": "Stock quantity must be a valid number",
    "number.integer": "Stock quantity must be a whole number",
    "number.min": "Stock quantity cannot be negative",
    "number.max": "Stock quantity cannot exceed 999,999",
  }),

  sku: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Z0-9\-\_]+$/)
    .messages({
      "string.empty": "SKU is required",
      "string.min": "SKU must be at least 3 characters long",
      "string.max": "SKU cannot exceed 100 characters",
      "string.pattern.base":
        "SKU must contain only uppercase letters, numbers, hyphens, and underscores",
    }),

  image_url: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .max(500)
    .allow("")
    .optional()
    .messages({
      "string.uri": "Image URL must be a valid HTTP or HTTPS URL",
      "string.max": "Image URL cannot exceed 500 characters",
    }),

  rating: Joi.number().min(0).max(5).precision(2).messages({
    "number.base": "Rating must be a valid number",
    "number.min": "Rating cannot be less than 0",
    "number.max": "Rating cannot exceed 5",
    "number.precision": "Rating can have at most 2 decimal places",
  }),

  review_count: Joi.number().integer().min(0).max(999999).messages({
    "number.base": "Review count must be a valid number",
    "number.integer": "Review count must be a whole number",
    "number.min": "Review count cannot be negative",
    "number.max": "Review count cannot exceed 999,999",
  }),

  is_active: Joi.boolean().messages({
    "boolean.base": "Active status must be true or false",
  }),
};

// Create product validation schema
export const createProductSchema = Joi.object({
  name: baseProductSchema.name.required(),
  description: baseProductSchema.description,
  category: baseProductSchema.category.required(),
  brand: baseProductSchema.brand.required(),
  price: baseProductSchema.price.required(),
  stock_quantity: baseProductSchema.stock_quantity.default(0),
  sku: baseProductSchema.sku.required(),
  image_url: baseProductSchema.image_url,
  rating: baseProductSchema.rating.default(0),
  review_count: baseProductSchema.review_count.default(0),
  is_active: baseProductSchema.is_active.default(true),
}).messages({
  "object.unknown": "Unknown field: {#label} is not allowed",
});

// Update product validation schema (all fields optional except constraints)
export const updateProductSchema = Joi.object({
  name: baseProductSchema.name.optional(),
  description: baseProductSchema.description,
  category: baseProductSchema.category.optional(),
  brand: baseProductSchema.brand.optional(),
  price: baseProductSchema.price.optional(),
  stock_quantity: baseProductSchema.stock_quantity.optional(),
  sku: baseProductSchema.sku.optional(),
  image_url: baseProductSchema.image_url,
  rating: baseProductSchema.rating.optional(),
  review_count: baseProductSchema.review_count.optional(),
  is_active: baseProductSchema.is_active.optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
    "object.unknown": "Unknown field: {#label} is not allowed",
  });

// Query parameters validation for filtering/pagination
export const getProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(10000).default(1).messages({
    "number.base": "Page must be a valid number",
    "number.integer": "Page must be a whole number",
    "number.min": "Page must be at least 1",
    "number.max": "Page cannot exceed 10,000",
  }),

  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "Limit must be a valid number",
    "number.integer": "Limit must be a whole number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  category: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\_\&]+$/)
    .optional()
    .messages({
      "string.max": "Category filter cannot exceed 100 characters",
      "string.pattern.base": "Category filter contains invalid characters",
    }),

  brand: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\_\.\&]+$/)
    .optional()
    .messages({
      "string.max": "Brand filter cannot exceed 100 characters",
      "string.pattern.base": "Brand filter contains invalid characters",
    }),

  min_price: Joi.number()
    .min(0)
    .precision(2)
    .max(999999.99)
    .optional()
    .messages({
      "number.base": "Minimum price must be a valid number",
      "number.min": "Minimum price cannot be negative",
      "number.precision": "Minimum price can have at most 2 decimal places",
      "number.max": "Minimum price cannot exceed $999,999.99",
    }),

  max_price: Joi.number()
    .min(0)
    .precision(2)
    .max(999999.99)
    .optional()
    .when("min_price", {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref("min_price")),
      otherwise: Joi.number(),
    })
    .messages({
      "number.base": "Maximum price must be a valid number",
      "number.min": "Maximum price cannot be negative",
      "number.precision": "Maximum price can have at most 2 decimal places",
      "number.max": "Maximum price cannot exceed $999,999.99",
      "number.greater": "Maximum price must be greater than minimum price",
    }),

  search: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .pattern(/^[a-zA-Z0-9\s\-\_\.\,\&\(\)]+$/)
    .optional()
    .messages({
      "string.min": "Search term must be at least 1 character long",
      "string.max": "Search term cannot exceed 255 characters",
      "string.pattern.base": "Search term contains invalid characters",
    }),

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
    .default("created_at")
    .messages({
      "any.only":
        "Sort field must be one of: name, price, rating, created_at, category, brand, stock_quantity",
    }),

  sort_order: Joi.string()
    .valid("ASC", "DESC", "asc", "desc")
    .default("DESC")
    .messages({
      "any.only": "Sort order must be either ASC or DESC",
    }),

  is_active: Joi.boolean().default(true).messages({
    "boolean.base": "Active filter must be true or false",
  }),
});

// Search query validation
export const searchProductsQuerySchema = Joi.object({
  q: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .pattern(/^[a-zA-Z0-9\s\-\_\.\,\&\(\)]+$/)
    .required()
    .messages({
      "string.empty": "Search query is required",
      "string.min": "Search query must be at least 2 characters long",
      "string.max": "Search query cannot exceed 255 characters",
      "string.pattern.base": "Search query contains invalid characters",
    }),

  page: Joi.number().integer().min(1).max(10000).default(1),

  limit: Joi.number().integer().min(1).max(100).default(20),

  sort_by: Joi.string()
    .valid("name", "price", "rating", "created_at", "category", "brand")
    .default("created_at"),

  sort_order: Joi.string().valid("ASC", "DESC", "asc", "desc").default("DESC"),
});

// Generate sample data validation
export const generateSampleDataSchema = Joi.object({
  count: Joi.number().integer().min(1).max(1000).default(50).messages({
    "number.base": "Count must be a valid number",
    "number.integer": "Count must be a whole number",
    "number.min": "Count must be at least 1",
    "number.max": "Count cannot exceed 1,000",
  }),
});

// UUID validation for path parameters
export const uuidSchema = Joi.string()
  .uuid({ version: "uuidv4" })
  .required()
  .messages({
    "string.empty": "Product ID is required",
    "string.uuid": "Product ID must be a valid UUID",
  });

// Statistics query validation
export const statisticsQuerySchema = Joi.object({
  include_inactive: Joi.boolean().default(false).messages({
    "boolean.base": "Include inactive must be true or false",
  }),
});

// Low stock products query validation
export const lowStockQuerySchema = Joi.object({
  threshold: Joi.number().integer().min(0).max(1000).default(10).messages({
    "number.base": "Threshold must be a valid number",
    "number.integer": "Threshold must be a whole number",
    "number.min": "Threshold cannot be negative",
    "number.max": "Threshold cannot exceed 1,000",
  }),
});

// Top rated products query validation
export const topRatedQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a valid number",
    "number.integer": "Limit must be a whole number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  min_rating: Joi.number().min(0).max(5).precision(2).default(4.0).messages({
    "number.base": "Minimum rating must be a valid number",
    "number.min": "Minimum rating cannot be less than 0",
    "number.max": "Minimum rating cannot exceed 5",
    "number.precision": "Minimum rating can have at most 2 decimal places",
  }),
});
