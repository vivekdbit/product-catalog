export class CreateProductTable1703001000000 {
  name = "CreateProductTable1703001000000";

  async up(queryRunner) {
    // Create products table
    await queryRunner.query(`
        CREATE TABLE "products" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "name" character varying(255) NOT NULL,
          "description" text,
          "category" character varying(100) NOT NULL,
          "brand" character varying(100) NOT NULL,
          "price" numeric(10,2) NOT NULL,
          "stock_quantity" integer NOT NULL DEFAULT 0,
          "sku" character varying(100) NOT NULL,
          "image_url" character varying(500),
          "is_active" boolean NOT NULL DEFAULT true,
          "rating" numeric(3,2) NOT NULL DEFAULT 0,
          "review_count" integer NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_products_sku" UNIQUE ("sku")
        )
      `);

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "idx_product_name" ON "products" ("name")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_category" ON "products" ("category")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_brand" ON "products" ("brand")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_price" ON "products" ("price")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_stock" ON "products" ("stock_quantity")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_active" ON "products" ("is_active")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_rating" ON "products" ("rating")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_created_at" ON "products" ("created_at")`
    );

    // Composite indexes for common query patterns
    await queryRunner.query(
      `CREATE INDEX "idx_products_category_active" ON "products" ("category", "is_active")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_brand_active" ON "products" ("brand", "is_active")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_price_active" ON "products" ("price", "is_active")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_name_active" ON "products" ("name", "is_active")`
    );

    // Add constraints
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_products_price_positive" CHECK ("price" >= 0)`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_products_stock_positive" CHECK ("stock_quantity" >= 0)`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_products_rating_range" CHECK ("rating" >= 0 AND "rating" <= 5)`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_products_review_count_positive" CHECK ("review_count" >= 0)`
    );

    console.log("✅ Products table created with indexes and constraints");
  }

  async down(queryRunner) {
    // Drop constraints first
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "CHK_products_review_count_positive"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "CHK_products_rating_range"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "CHK_products_stock_positive"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "CHK_products_price_positive"`
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_name_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_price_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_brand_active"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_products_category_active"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_stock"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_brand"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_name"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "products"`);

    console.log("✅ Products table and related objects dropped");
  }
}
