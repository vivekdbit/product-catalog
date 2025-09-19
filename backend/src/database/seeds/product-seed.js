import { AppDataSource } from "../data-source.js";
import { ProductRepository } from "../../modules/products/repositories/ProductRepository.js";

async function seedProducts() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();

    const productRepository = new ProductRepository();
    await productRepository.initialize();

    console.log("🔄 Generating seed data...");

    const categories = [
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

    const brands = [
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

    const adjectives = [
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
      "Essential",
      "Professional",
    ];

    const productDescriptions = {
      Electronics: [
        "High-performance device with cutting-edge technology",
        "Innovative design meets superior functionality",
        "Advanced features for the modern user",
        "Professional-grade quality and reliability",
      ],
      Clothing: [
        "Comfortable and stylish design for everyday wear",
        "Premium materials with exceptional craftsmanship",
        "Modern fit with classic appeal",
        "Versatile piece for any occasion",
      ],
      Books: [
        "Engaging content that captivates readers",
        "Comprehensive guide with expert insights",
        "Essential reading for knowledge seekers",
        "Thought-provoking narrative and analysis",
      ],
      "Home & Garden": [
        "Transform your living space with style",
        "Durable construction for long-lasting use",
        "Functional design meets aesthetic appeal",
        "Perfect addition to any home",
      ],
      Sports: [
        "Professional-grade equipment for peak performance",
        "Engineered for durability and comfort",
        "Enhanced performance for serious athletes",
        "Quality gear for your active lifestyle",
      ],
    };

    // Generate products in batches
    const batchSize = 50;
    const totalProducts = 200;
    const batches = Math.ceil(totalProducts / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const products = [];
      const currentBatchSize = Math.min(
        batchSize,
        totalProducts - batch * batchSize
      );

      for (let i = 1; i <= currentBatchSize; i++) {
        const productIndex = batch * batchSize + i;
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const adjective =
          adjectives[Math.floor(Math.random() * adjectives.length)];

        // Get category-specific description or fallback to generic
        const descriptions =
          productDescriptions[category] || productDescriptions["Electronics"];
        const description =
          descriptions[Math.floor(Math.random() * descriptions.length)];

        const product = {
          name: `${adjective} ${brand} ${category} Product ${productIndex}`,
          description: `${description} Perfect for your daily needs with advanced features and reliable performance.`,
          category,
          brand,
          price: Math.round((Math.random() * 2000 + 10) * 100) / 100, // $10 - $2010
          stock_quantity: Math.floor(Math.random() * 200) + 1, // 1-200
          sku: `SKU-${brand.toUpperCase()}-${category
            .toUpperCase()
            .replace(/[^A-Z]/g, "")}-${productIndex
            .toString()
            .padStart(5, "0")}`,
          image_url: `https://picsum.photos/400/400?random=${productIndex}`,
          rating: Math.round((Math.random() * 2 + 3) * 100) / 100, // 3.0 - 5.0
          review_count: Math.floor(Math.random() * 1000) + 1, // 1-1000
          is_active: Math.random() > 0.05, // 95% chance of being active
        };

        products.push(product);
      }

      // Save batch
      await productRepository.bulkCreate(products);
      console.log(
        `✅ Batch ${
          batch + 1
        }/${batches} completed (${currentBatchSize} products)`
      );
    }

    console.log(`✅ Successfully seeded ${totalProducts} products`);

    // Show statistics
    const stats = await productRepository.getStatistics();
    console.log("📊 Database Statistics:");
    console.log(`  - Total Products: ${stats.total_products}`);
    console.log(`  - Active Products: ${stats.active_products}`);
    console.log(`  - In Stock Products: ${stats.in_stock_products}`);
    console.log(`  - Average Price: $${stats.average_price.toFixed(2)}`);
    console.log(`  - Total Stock: ${stats.total_stock}`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

seedProducts();
