-- ========================================================
-- MIGRATION: ADICIONAR TABELA CUSTOMER E RELAÇÃO COM PEDIDOS
-- ========================================================

-- 1. Criar a Tabela de Clientes (Customer)
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Itu',
    "state" TEXT NOT NULL DEFAULT 'SP',
    "zipCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- 2. Criar Índice Único de E-mail para Clientes
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- 3. Adicionar Coluna de Relação customerId na Tabela Order
ALTER TABLE "Order" ADD COLUMN "customerId" TEXT;

-- 4. Adicionar Chave Estrangeira apontando para Customer
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" 
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;
