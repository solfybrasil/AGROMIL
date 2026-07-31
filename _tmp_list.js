const { Client } = require("pg");
const url = "postgresql://postgres:Larnja12*@db.ntouxmjmlrjehjsqkowr.supabase.co:6543/postgres?sslmode=require";
const c = new Client({ connectionString: url });
(async () => {
  await c.connect();
  const cats = await c.query('SELECT id, name, slug FROM "Category" ORDER BY "displayOrder"');
  console.log("CATEGORIES:", cats.rows.length);
  cats.rows.forEach((r) => console.log(" -", r.slug, "|", r.name, "|", r.id));
  const prod = await c.query('SELECT COUNT(*)::int AS n FROM "Product"');
  console.log("PRODUCTS:", prod.rows[0].n);
  await c.end();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
