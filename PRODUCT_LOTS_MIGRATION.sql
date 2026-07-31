-- ================================================================
-- MIGRATION: Cadastro Profissional de Produtos + Lotes de Compra
-- Execute no Supabase SQL Editor > New Query
-- ================================================================

-- ================================================================
-- PASSO 1: Adicionar novos campos na tabela Product
-- ================================================================

-- Preço pago (custo de aquisição)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(10,2) DEFAULT 0;

-- Preço no atacado (opcional)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "wholesalePrice" DECIMAL(10,2);

-- Desconto aplicado em %
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discountPercent" DECIMAL(5,2) DEFAULT 0;

-- Tag "Novidade"
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isNew" BOOLEAN NOT NULL DEFAULT false;

-- Tags livres (array)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';

-- Peso em gramas
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "weight" INTEGER DEFAULT 0;

-- Marca / Fornecedor
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brand" TEXT;

-- Estoque mínimo (gatilho de alerta)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "minStock" INTEGER NOT NULL DEFAULT 5;

-- Código de barras / EAN
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "barcode" TEXT;

-- ================================================================
-- PASSO 2: Criar tabela ProductLot (Lotes de Compra)
-- ================================================================
CREATE TABLE IF NOT EXISTS "ProductLot" (
  "id"           TEXT NOT NULL,
  "productId"    TEXT NOT NULL,
  "lotNumber"    TEXT NOT NULL,
  "quantity"     INTEGER NOT NULL DEFAULT 0,
  "costPrice"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  "supplier"     TEXT,
  "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiryDate"   TIMESTAMP(3),
  "notes"        TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductLot_pkey" PRIMARY KEY ("id")
);

-- Index para busca por produto
CREATE INDEX IF NOT EXISTS "ProductLot_productId_idx" ON "ProductLot"("productId");

-- Foreign Key: ProductLot -> Product
ALTER TABLE "ProductLot" DROP CONSTRAINT IF EXISTS "ProductLot_productId_fkey";
ALTER TABLE "ProductLot" ADD CONSTRAINT "ProductLot_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ================================================================
-- PASSO 3: RLS na nova tabela
-- ================================================================
ALTER TABLE "ProductLot" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_service_role" ON "ProductLot";
CREATE POLICY "allow_all_service_role" ON "ProductLot"
  FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- PASSO 4: Verificação Final
-- ================================================================
SELECT
  t.table_name,
  COUNT(c.column_name) AS total_colunas
FROM information_schema.tables t
JOIN information_schema.columns c USING (table_name, table_schema)
WHERE t.table_schema = 'public'
  AND t.table_name IN ('Product', 'ProductLot')
GROUP BY t.table_name
ORDER BY t.table_name;
