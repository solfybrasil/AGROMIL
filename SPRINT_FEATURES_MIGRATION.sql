-- ================================================================
-- SPRINT DE FEATURES — MIGRATION COMPLETA
-- Execute no Supabase SQL Editor
-- ================================================================

-- ─────────────────────────────────────────────────────────────────
-- 1. REVIEWS (Avaliações de Produtos)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Review" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "productId"  TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "rating"     INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "comment"    TEXT,
  "approved"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Review_productId_customerId_unique" UNIQUE ("productId", "customerId")
);
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");

-- ─────────────────────────────────────────────────────────────────
-- 2. COUPONS (Cupons de Desconto)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Coupon" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "code"        TEXT NOT NULL,
  "type"        TEXT NOT NULL DEFAULT 'percent', -- 'percent' | 'fixed'
  "value"       DECIMAL(10,2) NOT NULL,
  "minOrder"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  "maxUses"     INTEGER,
  "usedCount"   INTEGER NOT NULL DEFAULT 0,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "expiresAt"   TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"(UPPER("code"));

-- ─────────────────────────────────────────────────────────────────
-- 3. FAVORITES (Lista de Favoritos)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Favorite" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "customerId" TEXT NOT NULL,
  "productId"  TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Favorite_unique" UNIQUE ("customerId", "productId")
);
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────
-- 4. BANNERS (Campanhas Promocionais)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Banner" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title"        TEXT NOT NULL,
  "subtitle"     TEXT,
  "imageUrl"     TEXT,
  "linkUrl"      TEXT,
  "linkLabel"    TEXT,
  "bgColor"      TEXT NOT NULL DEFAULT '#1b4332',
  "textColor"    TEXT NOT NULL DEFAULT '#ffffff',
  "active"       BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "expiresAt"    TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────────
-- 5. STOCK ALERTS ("Avise-me")
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "StockAlert" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "phone"     TEXT,
  "notified"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "StockAlert_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StockAlert_unique" UNIQUE ("productId", "email")
);
ALTER TABLE "StockAlert" ADD CONSTRAINT "StockAlert_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────
-- 6. PRICE HISTORY (Histórico de Preços)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "PriceHistory" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "productId"  TEXT NOT NULL,
  "price"      DECIMAL(10,2) NOT NULL,
  "promoPrice" DECIMAL(10,2),
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS "PriceHistory_productId_idx" ON "PriceHistory"("productId");

-- ─────────────────────────────────────────────────────────────────
-- 7. SUBSCRIPTIONS (Pedidos Recorrentes)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "customerId"  TEXT NOT NULL,
  "frequency"   TEXT NOT NULL DEFAULT 'monthly', -- 'weekly' | 'biweekly' | 'monthly'
  "discount"    DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "nextOrderAt" TIMESTAMP(3),
  "lastOrderAt" TIMESTAMP(3),
  "items"       JSONB NOT NULL DEFAULT '[]',
  "address"     JSONB NOT NULL DEFAULT '{}',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────
-- 8. COUPON usado no Order
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode"    TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponDiscount" DECIMAL(10,2) DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────
-- 9. RLS — Permitir acesso via service role
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE "Review"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coupon"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Banner"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockAlert"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON "Review";
CREATE POLICY "allow_all" ON "Review"       FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON "Coupon";
CREATE POLICY "allow_all" ON "Coupon"       FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON "Favorite";
CREATE POLICY "allow_all" ON "Favorite"     FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON "Banner";
CREATE POLICY "allow_all" ON "Banner"       FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON "StockAlert";
CREATE POLICY "allow_all" ON "StockAlert"   FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON "PriceHistory";
CREATE POLICY "allow_all" ON "PriceHistory" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON "Subscription";
CREATE POLICY "allow_all" ON "Subscription" FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────
-- 10. Seed: Banners iniciais de exemplo
-- ─────────────────────────────────────────────────────────────────
INSERT INTO "Banner" ("id","title","subtitle","linkUrl","linkLabel","bgColor","active","displayOrder")
VALUES
  ('banner-1','Frete Grátis acima de R$ 150','Para todo o interior de Itu','/','Comprar Agora','#1b4332',true,1),
  ('banner-2','Ração Golden com 15% OFF','Válido até o fim do estoque','/categoria/petshop','Ver Ofertas','#92400e',true,2),
  ('banner-3','Novos Produtos de Irrigação','Gotejadores e mangueiras chegaram','/categoria/irrigacao','Conferir','#1e3a5f',true,3)
ON CONFLICT DO NOTHING;

-- Verificação: lista tabelas criadas no schema public
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
