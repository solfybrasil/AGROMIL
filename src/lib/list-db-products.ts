import { dbService } from "./db-service";

async function run() {
  console.log("Fetching products from database...");
  try {
    const products = await dbService.getProducts({ includeInactive: true });
    console.log(`Found ${products.length} products:`);
    products.forEach((p) => {
      console.log(`- ID: ${p.id} | Name: ${p.name} | Category: ${p.categoryId} | SKU: ${p.sku} | Active: ${p.active}`);
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

run();
