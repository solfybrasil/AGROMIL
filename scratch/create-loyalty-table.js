const { Client } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL;
console.log("Using DATABASE_URL:", connectionString ? "Loaded" : "Not Found");

// Let's also try port 6543 (connection pooler) if 5432 doesn't work.
const getConnectionString = () => {
  if (!connectionString) return null;
  // If we need to try port 6543, we replace :5432/ with :6543/
  return connectionString.replace(":5432/", ":6543/");
};

async function run() {
  const url = getConnectionString() || connectionString;
  console.log("Connecting to:", url.replace(/:[^:]*@/, ":****@")); // mask password
  
  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected successfully to PostgreSQL!");

    const sql = `
      CREATE TABLE IF NOT EXISTS "LoyaltyTransaction" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "orderId" TEXT,
        "points" INTEGER NOT NULL,
        "description" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "LoyaltyTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      
      -- Create index if not exists
      CREATE INDEX IF NOT EXISTS "LoyaltyTransaction_customerId_idx" ON "LoyaltyTransaction"("customerId");
    `;

    console.log("Executing SQL to create LoyaltyTransaction table...");
    await client.query(sql);
    console.log("LoyaltyTransaction table created successfully!");

  } catch (err) {
    console.error("Database connection or execution failed:", err);
  } finally {
    await client.end();
  }
}

run();
