import { dbService } from "./db-service";

async function run() {
  console.log("Starting product creation test...");
  try {
    const testPayload = {
      name: "Produto Teste " + Date.now(),
      description: "Descrição de teste para validar inserção no banco de dados.",
      shortDesc: "Descrição curta teste.",
      price: 15.99,
      promoPrice: 12.99,
      stock: 10,
      unit: "Unidade",
      sku: "TEST-" + Math.floor(1000 + Math.random() * 9000),
      categoryId: "cat-jardinagem", // must match seed ID or existing ID
      active: true,
      featured: false,
    };

    console.log("Calling dbService.createProduct with payload:", testPayload);
    const result = await dbService.createProduct(testPayload);
    console.log("Success! Product created:", result);
  } catch (error: any) {
    console.error("Test failed with error:", error);
    if (error && typeof error === "object") {
      console.error("Error keys:", Object.keys(error));
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
  }
}

run();
