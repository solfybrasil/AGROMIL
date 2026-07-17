-- ============================================================
-- MIGRATION: Adicionar productName na tabela OrderItem
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- 1. Adicionar coluna productName (snapshot do nome do produto)
ALTER TABLE "OrderItem"
  ADD COLUMN IF NOT EXISTS "productName" TEXT;

-- 2. Opcional: preencher nomes existentes buscando do produto
UPDATE "OrderItem" oi
SET "productName" = p.name
FROM "Product" p
WHERE oi."productId" = p.id
  AND oi."productName" IS NULL;

-- Confirmar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'OrderItem'
ORDER BY ordinal_position;
