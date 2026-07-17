-- Drop existing tables and types if they exist to prevent conflict errors
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "AdminUser" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDesc" VARCHAR(255),
    "price" DECIMAL(10,2) NOT NULL,
    "promoPrice" DECIMAL(10,2),
    "categoryId" TEXT NOT NULL,
    "images" TEXT[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'unidade',
    "sku" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable AdminUser
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientEmail" TEXT,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Itu',
    "state" TEXT NOT NULL DEFAULT 'SP',
    "zipCode" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrderItem
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ==========================================
-- SEED DATA (CARGA INICIAL DE DADOS)
-- ==========================================

-- 1. Inserir Usuário Administrador (Senha: Agromil2026!)
INSERT INTO "AdminUser" ("id", "name", "email", "password", "role", "active", "createdAt")
VALUES (
  'admin-user-id',
  'Administrador Agromil',
  'admin@agromil.com.br',
  '$2b$10$FRMg.Rng46iEzgKsulFFq./Tao4pXm/d5rWPsODX.OnU9J9ZAU8Ri',
  'admin',
  true,
  CURRENT_TIMESTAMP
) ON CONFLICT ("email") DO NOTHING;

-- 2. Inserir Categorias Iniciais
INSERT INTO "Category" ("id", "name", "slug", "imageUrl", "displayOrder", "updatedAt")
VALUES
  ('cat-jardinagem', 'Jardinagem & Vasos', 'jardinagem', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600', 1, CURRENT_TIMESTAMP),
  ('cat-petshop', 'Rações & Acessórios Pet', 'petshop', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600', 2, CURRENT_TIMESTAMP),
  ('cat-agropecuaria', 'Agropecuária Geral', 'agropecuaria', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600', 3, CURRENT_TIMESTAMP),
  ('cat-ferramentas', 'Ferramentas & Equipamentos', 'ferramentas', 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600', 4, CURRENT_TIMESTAMP),
  ('cat-irrigacao', 'Irrigação', 'irrigacao', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600', 5, CURRENT_TIMESTAMP),
  ('cat-vestuario-epi', 'Vestuário & EPI', 'vestuario-epi', 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600', 6, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 3. Inserir Produtos Iniciais
INSERT INTO "Product" ("id", "name", "description", "shortDesc", "price", "promoPrice", "categoryId", "images", "stock", "unit", "sku", "active", "featured", "updatedAt")
VALUES
  ('m-1', 'Adubo Orgânico Concentrado Húmus de Minhoca 5kg', 'Húmus de minhoca 100% orgânico e puro. Rico em nutrientes essenciais, melhora a estrutura do solo, estimula o enraizamento.', 'Húmus de minhoca 100% orgânico e puro para o solo do seu jardim.', 24.90, 19.90, 'cat-jardinagem', ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600'], 35, 'Saco 5kg', 'JAD-001', true, true, CURRENT_TIMESTAMP),
  ('m-2', 'Vaso Auto-irrigável Gourmet N03 Verde Floresta', 'Vaso auto-irrigável com sistema de cordões que funcionam como uma espécie de raiz artificial, mantendo a umidade ideal da terra por até 14 dias.', 'Mantenha suas plantas hidratadas de forma prática e limpa.', 32.90, NULL, 'cat-jardinagem', ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600'], 20, 'Unidade', 'JAD-002', true, true, CURRENT_TIMESTAMP),
  ('m-3', 'Pá de Mão Estreita Tramontina em Aço', 'Pá de mão fabricada em aço carbono de alta resistência com cabo ergonômico. Ideal para cavar, remover e transportar terra.', 'Ferramenta leve e resistente para manejo de mudas e canteiros.', 15.50, NULL, 'cat-jardinagem', ARRAY['https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=600'], 50, 'Unidade', 'JAD-003', true, false, CURRENT_TIMESTAMP),
  ('m-4', 'Ração Premium Especial Cães Adultos Frango e Arroz 15kg', 'Alimento completo de alta performance para cães adultos de médio e grande porte. Rica em proteínas de alto valor biológico.', 'Alimento completo e balanceado com frango e arroz para cães adultos.', 189.90, 169.90, 'cat-petshop', ARRAY['https://images.unsplash.com/photo-1589924691106-07416955937c?q=80&w=600'], 15, 'Saco 15kg', 'PET-001', true, true, CURRENT_TIMESTAMP),
  ('m-5', 'Antipulgas e Carrapatos Simparic 20mg (Cães 5 a 10kg)', 'Simparic é um comprimido mastigável altamente eficaz contra pulgas, carrapatos e sarnas. Mantém a eficácia protetora por até 35 dias.', 'Comprimido mastigável eficaz contra pulgas, carrapatos e sarnas por 35 dias.', 94.50, NULL, 'cat-petshop', ARRAY['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600'], 45, 'Caixa 1 Comp.', 'PET-002', true, true, CURRENT_TIMESTAMP),
  ('m-6', 'Sal Mineral 80 Fosforo para Bovinos 25kg', 'Suplemento mineral pronto para uso, indicado para bovinos de corte em fase de cria, recria e engorda. Garante o suprimento de fósforo.', 'Suplemento mineral de alta qualidade para nutrição de bovinos de corte.', 110.00, NULL, 'cat-agropecuaria', ARRAY['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600'], 80, 'Saco 25kg', 'AGR-001', true, true, CURRENT_TIMESTAMP),
  ('m-7', 'Ração para Aves Postura Quibei 20kg', 'Ração balanceada de postura em farelo ou triturada. Formulação especial com cálcio e fósforo nas proporções ideais.', 'Ração de postura balanceada para galinhas poedeiras de terreiro ou granja.', 78.00, 72.90, 'cat-agropecuaria', ARRAY['https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=600'], 40, 'Saco 20kg', 'AGR-002', true, false, CURRENT_TIMESTAMP),
  ('m-8', 'Pulverizador Costal Agrícola Guarany 20L', 'Pulverizador costal com bomba de pistão e design ergonômico. Tanque de alta durabilidade e bico regulável.', 'Pulverizador de alta durabilidade e bombeamento suave de 20 litros.', 349.90, 319.00, 'cat-ferramentas', ARRAY['https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600'], 8, 'Unidade', 'FER-001', true, true, CURRENT_TIMESTAMP),
  ('m-9', 'Tesoura de Poda Profissional Bypass Tramontina', 'Tesoura de poda bypass com lâmina em aço temperado e cabo emborrachado com amortecedor. Ideal para galhos secos ou verdes.', 'Corte preciso e macio para manutenção de árvores frutíferas e jardins.', 59.90, NULL, 'cat-ferramentas', ARRAY['https://images.unsplash.com/photo-1598902108854-10e335adac99?q=80&w=600'], 25, 'Unidade', 'FER-002', true, false, CURRENT_TIMESTAMP),
  ('m-10', 'Mangueira de Jardim Flexível Trançada 1/2'' 20 Metros', 'Mangueira de jardim super resistente com tripla camada trançada em nylon. Acompanha bico com jato regulável e adaptadores.', 'Mangueira de alta durabilidade trançada de 20 metros com esguicho.', 89.90, NULL, 'cat-irrigacao', ARRAY['https://images.unsplash.com/photo-1558905657-497766e90c74?q=80&w=600'], 30, 'Rolo 20m', 'IRR-001', true, true, CURRENT_TIMESTAMP),
  ('m-11', 'Bota de PVC Impermeável Cano Curto Preta Grendene', 'Bota de PVC cano curto impermeável, antiderrapante, ideal para trabalhos em locais úmidos, horta e lavagem de instalações rurais.', 'Bota de borracha impermeável cano curto, segura e antiderrapante.', 49.90, NULL, 'cat-vestuario-epi', ARRAY['https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600'], 22, 'Par', 'EPI-001', true, false, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
