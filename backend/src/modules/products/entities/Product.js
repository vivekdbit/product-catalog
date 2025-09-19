import { EntitySchema } from "typeorm";

export const Product = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    category: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    brand: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      transformer: {
        to: (value) => value,
        from: (value) => parseFloat(value),
      },
    },
    stock_quantity: {
      type: "int",
      default: 0,
    },
    sku: {
      type: "varchar",
      length: 100,
      unique: true,
      nullable: false,
    },
    image_url: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    rating: {
      type: "decimal",
      precision: 3,
      scale: 2,
      default: 0,
      transformer: {
        to: (value) => value,
        from: (value) => parseFloat(value),
      },
    },
    review_count: {
      type: "int",
      default: 0,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
  indices: [
    {
      name: "idx_product_name",
      columns: ["name"],
    },
    {
      name: "idx_product_category",
      columns: ["category"],
    },
    {
      name: "idx_product_brand",
      columns: ["brand"],
    },
    {
      name: "idx_product_price",
      columns: ["price"],
    },
    {
      name: "idx_product_stock",
      columns: ["stock_quantity"],
    },
    {
      name: "idx_product_active",
      columns: ["is_active"],
    },
    {
      name: "idx_product_rating",
      columns: ["rating"],
    },
    {
      name: "idx_products_category_active",
      columns: ["category", "is_active"],
    },
    {
      name: "idx_products_brand_active",
      columns: ["brand", "is_active"],
    },
    {
      name: "idx_products_price_active",
      columns: ["price", "is_active"],
    },
    {
      name: "idx_products_name_active",
      columns: ["name", "is_active"],
    },
  ],
  checks: [
    {
      name: "CHK_products_price_positive",
      expression: "price >= 0",
    },
    {
      name: "CHK_products_stock_positive",
      expression: "stock_quantity >= 0",
    },
    {
      name: "CHK_products_rating_range",
      expression: "rating >= 0 AND rating <= 5",
    },
    {
      name: "CHK_products_review_count_positive",
      expression: "review_count >= 0",
    },
  ],
});

// Helper class for product instances
export class ProductModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  // Instance methods
  isInStock() {
    return this.stock_quantity > 0;
  }

  getDiscountedPrice(discountPercent) {
    return this.price * (1 - discountPercent / 100);
  }

  getAverageRating() {
    return this.rating || 0;
  }

  validateData() {
    // Validate price
    if (this.price < 0) {
      throw new Error("Price cannot be negative");
    }

    // Validate stock quantity
    if (this.stock_quantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }

    // Validate rating
    if (this.rating < 0 || this.rating > 5) {
      throw new Error("Rating must be between 0 and 5");
    }

    // Validate review count
    if (this.review_count < 0) {
      throw new Error("Review count cannot be negative");
    }

    // Trim whitespace from string fields
    if (this.name) this.name = this.name.trim();
    if (this.description) this.description = this.description.trim();
    if (this.category) this.category = this.category.trim();
    if (this.brand) this.brand = this.brand.trim();
    if (this.sku) this.sku = this.sku.trim().toUpperCase();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      brand: this.brand,
      price: parseFloat(this.price),
      stock_quantity: this.stock_quantity,
      sku: this.sku,
      image_url: this.image_url,
      is_active: this.is_active,
      rating: parseFloat(this.rating || 0),
      review_count: this.review_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
      in_stock: this.isInStock(),
    };
  }

  // Static method to create instance from data
  static fromData(data) {
    const instance = new ProductModel(data);
    instance.validateData();
    return instance;
  }
}
