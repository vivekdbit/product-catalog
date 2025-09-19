/**
 * Product categories available in the system
 */
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
  "Toys",
  "Beauty",
  "Automotive",
  "Health",
  "Food",
];

/**
 * Product brands available in the system
 */
export const PRODUCT_BRANDS = [
  "Apple",
  "Samsung",
  "Nike",
  "Adidas",
  "Sony",
  "Microsoft",
  "Amazon",
  "Google",
  "Dell",
  "HP",
  "Canon",
  "LG",
];

/**
 * Adjectives for generating sample product names
 */
export const PRODUCT_ADJECTIVES = [
  "Premium",
  "Ultra",
  "Pro",
  "Max",
  "Elite",
  "Smart",
  "Advanced",
  "Classic",
  "Modern",
  "Luxury",
];

/**
 * Default product configuration
 */
export const PRODUCT_DEFAULTS = {
  STOCK_QUANTITY: 0,
  RATING: 0,
  REVIEW_COUNT: 0,
  IS_ACTIVE: true,
  MIN_RATING: 3,
  MAX_RATING: 5,
  MAX_REVIEW_COUNT: 500,
  MAX_STOCK_QUANTITY: 100,
  MIN_PRICE: 10,
  MAX_PRICE: 1000,
};

/**
 * Product validation limits
 */
export const PRODUCT_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
  CATEGORY_MIN_LENGTH: 2,
  CATEGORY_MAX_LENGTH: 100,
  BRAND_MIN_LENGTH: 1,
  BRAND_MAX_LENGTH: 100,
  SKU_MIN_LENGTH: 3,
  SKU_MAX_LENGTH: 100,
  IMAGE_URL_MAX_LENGTH: 500,
  MAX_PRICE: 999999.99,
  MAX_RATING: 5,
  MIN_RATING: 0,
};

/**
 * Product status constants
 */
export const PRODUCT_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

/**
 * Sort options for products
 */
export const PRODUCT_SORT_OPTIONS = [
  "name",
  "price",
  "rating",
  "created_at",
  "category",
  "brand",
  "stock_quantity",
];

/**
 * Sort order options
 */
export const SORT_ORDER_OPTIONS = ["ASC", "DESC", "asc", "desc"];
