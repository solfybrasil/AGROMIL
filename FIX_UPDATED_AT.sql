-- ================================================================
-- FIX URGENTE: Adicionar DEFAULT NOW() nas colunas updatedAt
-- Copie e execute ESTE SQL no Supabase > SQL Editor
-- ================================================================

-- Isso resolve o erro:
-- "null value in column 'updatedAt' violates not-null constraint"

-- 1. Order
ALTER TABLE "Order"
  ALTER COLUMN "updatedAt" SET DEFAULT NOW(),
  ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- 2. OrderItem (não tem updatedAt, mas garantimos o id default)
ALTER TABLE "OrderItem"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- 3. Customer
ALTER TABLE "Customer"
  ALTER COLUMN "updatedAt" SET DEFAULT NOW(),
  ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- 4. Category
ALTER TABLE "Category"
  ALTER COLUMN "updatedAt" SET DEFAULT NOW(),
  ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- 5. Product
ALTER TABLE "Product"
  ALTER COLUMN "updatedAt" SET DEFAULT NOW(),
  ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- 6. Confirmar que os defaults foram aplicados
SELECT
  table_name,
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('updatedAt', 'createdAt', 'id')
  AND table_name IN ('Order', 'OrderItem', 'Customer', 'Category', 'Product')
ORDER BY table_name, column_name;
