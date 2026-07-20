-- Allow deleting products that are referenced by past orders.
-- 1. Drop the old RESTRICT foreign key
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";

-- 2. Make productId nullable so historical order items keep their
--    productName snapshot even after the product is removed
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;

-- 3. Re-create the foreign key with ON DELETE SET NULL so deleting a
--    product keeps the order item record (snapshot preserved) instead
--    of violating the foreign key constraint.
ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
