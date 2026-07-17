import { dbService } from "./db-service";

async function run() {
  console.log("Fetching categories from database...");
  try {
    const categories = await dbService.getCategories();
    console.log(`Found ${categories.length} categories:`);
    categories.forEach((c) => {
      console.log(`- ID: ${c.id} | Name: ${c.name} | Slug: ${c.slug}`);
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
}

run();
