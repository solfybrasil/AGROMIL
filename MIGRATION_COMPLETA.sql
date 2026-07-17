-- ================================================================
-- MIGRATION COMPLETA - AGROMIL MARKETPLACE
-- Execute no Supabase SQL Editor > New Query
-- ================================================================

-- ================================================================
-- PASSO 1: Criar o tipo ENUM de status (se não existir)
-- ================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
    CREATE TYPE "OrderStatus" AS ENUM (
      'NEW', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    );
  END IF;
END$$;

-- ================================================================
-- PASSO 2: Criar tabela Category (se não existir)
-- ================================================================
CREATE TABLE IF NOT EXISTS "Category" (
  "id"           TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "slug"         TEXT NOT NULL,
  "imageUrl"     TEXT,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

-- ================================================================
-- PASSO 3: Criar tabela Product (se não existir)
-- ================================================================
CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "shortDesc"   VARCHAR(255),
  "price"       DECIMAL(10,2) NOT NULL,
  "promoPrice"  DECIMAL(10,2),
  "categoryId"  TEXT NOT NULL,
  "images"      TEXT[],
  "stock"       INTEGER NOT NULL DEFAULT 0,
  "unit"        TEXT NOT NULL DEFAULT 'unidade',
  "sku"         TEXT,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "featured"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku") WHERE "sku" IS NOT NULL;

-- ================================================================
-- PASSO 4: Criar tabela AdminUser (se não existir)
-- ================================================================
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "password"  TEXT NOT NULL,
  "role"      TEXT NOT NULL DEFAULT 'admin',
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");

-- ================================================================
-- PASSO 5: Criar tabela Customer (se não existir)
-- ================================================================
CREATE TABLE IF NOT EXISTS "Customer" (
  "id"           TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "email"        TEXT NOT NULL,
  "password"     TEXT NOT NULL,
  "phone"        TEXT NOT NULL,
  "street"       TEXT NOT NULL DEFAULT '',
  "number"       TEXT NOT NULL DEFAULT '',
  "complement"   TEXT,
  "neighborhood" TEXT NOT NULL DEFAULT '',
  "city"         TEXT NOT NULL DEFAULT 'Itu',
  "state"        TEXT NOT NULL DEFAULT 'SP',
  "zipCode"      TEXT NOT NULL DEFAULT '',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer"("email");

-- ================================================================
-- PASSO 6: Criar tabela Order (se não existir)
-- ================================================================
CREATE TABLE IF NOT EXISTS "Order" (
  "id"            TEXT NOT NULL,
  "clientName"    TEXT NOT NULL,
  "clientPhone"   TEXT NOT NULL,
  "clientEmail"   TEXT,
  "street"        TEXT NOT NULL,
  "number"        TEXT NOT NULL,
  "complement"    TEXT,
  "neighborhood"  TEXT NOT NULL,
  "city"          TEXT NOT NULL DEFAULT 'Itu',
  "state"         TEXT NOT NULL DEFAULT 'SP',
  "zipCode"       TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "subtotal"      DECIMAL(10,2) NOT NULL,
  "deliveryFee"   DECIMAL(10,2) NOT NULL DEFAULT 0,
  "total"         DECIMAL(10,2) NOT NULL,
  "status"        "OrderStatus" NOT NULL DEFAULT 'NEW',
  "notes"         TEXT,
  "customerId"    TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- ================================================================
-- PASSO 7: Criar tabela OrderItem (se não existir)
-- ================================================================
CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id"          TEXT NOT NULL,
  "orderId"     TEXT NOT NULL,
  "productId"   TEXT NOT NULL,
  "productName" TEXT,
  "quantity"    INTEGER NOT NULL,
  "price"       DECIMAL(10,2) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- ================================================================
-- PASSO 8: Adicionar colunas faltantes (se já existirem as tabelas)
-- ================================================================

-- Coluna customerId na Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" TEXT;

-- Coluna productName no OrderItem
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productName" TEXT;

-- ================================================================
-- PASSO 9: Foreign Keys
-- ================================================================

-- Product -> Category
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- OrderItem -> Order
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- OrderItem -> Product
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order -> Customer
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_customerId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ================================================================
-- PASSO 10: Atualizar productName em itens existentes
-- ================================================================
UPDATE "OrderItem" oi
SET "productName" = p.name
FROM "Product" p
WHERE oi."productId" = p.id
  AND oi."productName" IS NULL;

-- ================================================================
-- PASSO 11: Row Level Security (RLS)
-- ================================================================

-- Desativa RLS em todas as tabelas (modo service role simplificado)
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;

-- Política: acesso total via service role (sua API usa a service key)
DROP POLICY IF EXISTS "allow_all_service_role" ON "Category";
CREATE POLICY "allow_all_service_role" ON "Category"
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_service_role" ON "Product";
CREATE POLICY "allow_all_service_role" ON "Product"
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_service_role" ON "Order";
CREATE POLICY "allow_all_service_role" ON "Order"
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_service_role" ON "OrderItem";
CREATE POLICY "allow_all_service_role" ON "OrderItem"
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_service_role" ON "Customer";
CREATE POLICY "allow_all_service_role" ON "Customer"
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_service_role" ON "AdminUser";
CREATE POLICY "allow_all_service_role" ON "AdminUser"
  FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- PASSO 12: Verificação Final
-- ================================================================
SELECT
  t.table_name,
  COUNT(c.column_name) AS total_colunas
FROM information_schema.tables t
JOIN information_schema.columns c USING (table_name, table_schema)
WHERE t.table_schema = 'public'
  AND t.table_name IN ('Category','Product','Order','OrderItem','Customer','AdminUser')
GROUP BY t.table_name
ORDER BY t.table_name;
