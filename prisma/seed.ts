import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

const prisma = connectionString
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  : new PrismaClient({} as any);

async function main() {
  console.log("Seeding SILUET fashion database...");

  // 1. Create Admin User
  const adminEmail = "admin@siluet.com.br";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("SiluetModa2026!", 10);
    await prisma.adminUser.create({
      data: {
        name: "Administrador SILUET",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        active: true,
      },
    });
    console.log("Admin user created: admin@siluet.com.br / SiluetModa2026!");
  }

  // 2. Create Categories for SILUET Fashion
  const categoriesData = [
    { name: "Vestidos & Midis", slug: "vestidos", displayOrder: 1, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600" },
    { name: "Tops & Blusas", slug: "tops-blusas", displayOrder: 2, imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600" },
    { name: "Conjuntos & Tailoring", slug: "conjuntos", displayOrder: 3, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600" },
    { name: "Calças & Wide Leg", slug: "calcas-jeans", displayOrder: 4, imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600" },
    { name: "Bolsas & Acessórios", slug: "acessorios", displayOrder: 5, imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600" },
    { name: "Calçados & Mules", slug: "calcados", displayOrder: 6, imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, displayOrder: cat.displayOrder, imageUrl: cat.imageUrl },
      create: cat,
    });
    categories.push(upserted);
  }
  console.log(`Seeded ${categories.length} fashion categories.`);

  const catMap = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.id;
    return acc;
  }, {} as Record<string, string>);

  // 3. Create SILUET Fashion Products
  const productsData = [
    // Vestidos
    {
      name: "Vestido Midi Linho Terracota Sunset",
      description: "Vestido midi em mistura de linho natural com decote transpassado e amarrações na cintura. Modelagem fluida e elegante perfeita para dias ensolarados ou eventos casuais chiques. Acompanha forro suave e fenda lateral sutil.",
      shortDesc: "Vestido midi elegante em linho terracota com amarração na cintura.",
      price: 189.90,
      promoPrice: 139.90,
      categoryId: catMap["vestidos"],
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600"
      ],
      stock: 40,
      unit: "Tamanhos: P, M, G, GG",
      sku: "SLT-DRS-001",
      active: true,
      featured: true,
    },
    {
      name: "Vestido Canelado Cut-Out Bege Areia",
      description: "Vestido justo em malha canelada encorpada de alta elasticidade com detalhe cut-out minimalista no decote. Conforto e caimento impecável que valoriza a silhueta.",
      shortDesc: "Vestido justo canelado bege com fenda e decote sutil.",
      price: 149.90,
      promoPrice: 99.90,
      categoryId: catMap["vestidos"],
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600"
      ],
      stock: 28,
      unit: "Tamanhos: P, M, G",
      sku: "SLT-DRS-002",
      active: true,
      featured: true,
    },

    // Tops & Blusas
    {
      name: "Blusa Transpassada Acetinada Marrom Cacau",
      description: "Blusa feminina em tecido acetinado de toque aveludado com decote V transpassado e mangas levemente abulonadas. Perfeita para compor looks de alfaiataria ou casuais sofisticados.",
      shortDesc: "Blusa feminina acetinada marrom cacau com caimento fluido.",
      price: 119.90,
      promoPrice: 89.90,
      categoryId: catMap["tops-blusas"],
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600"
      ],
      stock: 50,
      unit: "Tamanhos: P, M, G, GG",
      sku: "SLT-TOP-001",
      active: true,
      featured: true,
    },
    {
      name: "Cropped Tricot Boho Terracota",
      description: "Top cropped confeccionado em tricot com pontos abertos textura boho. Possui alças médias e barra ondulada delicada. Ideal para combinar com calças de cintura alta.",
      shortDesc: "Cropped em tricot boho terracota de textura premium.",
      price: 89.90,
      promoPrice: 59.90,
      categoryId: catMap["tops-blusas"],
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600"
      ],
      stock: 60,
      unit: "Tamanhos: P, M, G",
      sku: "SLT-TOP-002",
      active: true,
      featured: false,
    },

    // Conjuntos
    {
      name: "Conjunto Alfaiataria Blazer + Short Terracota Chic",
      description: "Conjunto feminino estruturado em tecido viscose estruturada. Blazer alongado com lapela clássica e botão forrado + Short de alfaiataria com bolso faca e cós alto. Elegância garantida.",
      shortDesc: "Conjunto blazer alongado e short alfaiataria terracota.",
      price: 279.90,
      promoPrice: 199.90,
      categoryId: catMap["conjuntos"],
      images: [
        "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=600"
      ],
      stock: 25,
      unit: "Tamanhos: P, M, G",
      sku: "SLT-SET-001",
      active: true,
      featured: true,
    },
    {
      name: "Conjunto Ribana Casual Bege Latte (Cropped + Calça)",
      description: "Conjunto casual e ultra confortável em malha ribana premium. Cropped de manga longa + Calça jogger fluida com elástico na cintura e bolsos funcionais.",
      shortDesc: "Conjunto em malha ribana macia bege latte para o dia a dia.",
      price: 169.90,
      promoPrice: 119.90,
      categoryId: catMap["conjuntos"],
      images: [
        "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=600"
      ],
      stock: 32,
      unit: "Tamanhos: P, M, G, GG",
      sku: "SLT-SET-002",
      active: true,
      featured: true,
    },

    // Calças & Wide Leg
    {
      name: "Calça Wide Leg Linho Natural Bege",
      description: "Calça com corte wide leg pantacourt em linho misto natural. Possui pregas frontais refinadas, bolsos laterais embutidos e fechamento por zíper e botão de madeira sustentável.",
      shortDesc: "Calça wide leg fluida em linho bege natural com pregas.",
      price: 179.90,
      promoPrice: 129.90,
      categoryId: catMap["calcas-jeans"],
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600"
      ],
      stock: 35,
      unit: "Tamanhos: 36, 38, 40, 42, 44",
      sku: "SLT-PNT-001",
      active: true,
      featured: true,
    },
    {
      name: "Calça Alfaiataria Reta Marrom Espresso",
      description: "Calça reta em tecido alfaiataria com caimento impecável que alonga a silhueta. Cós alto com passantes de cinto e vincos demarcados.",
      shortDesc: "Calça reta alfaiataria marrom espresso de cós alto.",
      price: 159.90,
      promoPrice: 119.90,
      categoryId: catMap["calcas-jeans"],
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600"
      ],
      stock: 40,
      unit: "Tamanhos: 36, 38, 40, 42",
      sku: "SLT-PNT-002",
      active: true,
      featured: false,
    },

    // Acessórios
    {
      name: "Bolsa Baguete Couro Eco Terracota",
      description: "Bolsa feminina modelo baguete estruturada em couro ecológico premium com textura sutil e metais dourados antiferrugem. Acompanha alça ajustável de ombro e transversal.",
      shortDesc: "Bolsa baguete estruturada em couro eco tom terracota.",
      price: 139.90,
      promoPrice: 89.90,
      categoryId: catMap["acessorios"],
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600"
      ],
      stock: 50,
      unit: "Tamanho Único",
      sku: "SLT-ACC-001",
      active: true,
      featured: true,
    },

    // Calçados
    {
      name: "Sandália Mule Salto Bloco Bege Cappuccino",
      description: "Sandália mule feminina com salto bloco de 6cm, tiras acolchoadas macias e palmilha confort revestida. Design minimalista e versátil para usar o dia todo.",
      shortDesc: "Mule com salto bloco macio e tiras em bege cappuccino.",
      price: 159.90,
      promoPrice: 119.90,
      categoryId: catMap["calcados"],
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600"
      ],
      stock: 20,
      unit: "Tamanhos: 34 ao 39",
      sku: "SLT-SHW-001",
      active: true,
      featured: true,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: prod,
      create: prod,
    });
  }

  console.log("SILUET fashion catalog seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
