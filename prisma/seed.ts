import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed database with stock photography URLs...");

  // 1. Create Admin User
  const adminEmail = "admin@agromil.com.br";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Agromil2026!", 10);
    await prisma.adminUser.create({
      data: {
        name: "Administrador Agromil",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        active: true,
      },
    });
    console.log("Admin user created: admin@agromil.com.br / Agromil2026!");
  } else {
    console.log("Admin user already exists.");
  }

  // 2. Create Categories with Unsplash Stock Images
  const categoriesData = [
    { name: "Jardinagem", slug: "jardinagem", displayOrder: 1, imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600" },
    { name: "Pet Shop", slug: "petshop", displayOrder: 2, imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600" },
    { name: "Agropecuária Geral", slug: "agropecuaria", displayOrder: 3, imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600" },
    { name: "Ferramentas", slug: "ferramentas", displayOrder: 4, imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600" },
    { name: "Irrigação", slug: "irrigacao", displayOrder: 5, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600" },
    { name: "Vestuário & EPI", slug: "vestuario-epi", displayOrder: 6, imageUrl: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600" },
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
  console.log(`Seeded ${categories.length} categories.`);

  // Find category map
  const catMap = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.id;
    return acc;
  }, {} as Record<string, string>);

  // 3. Create Products with Unsplash Stock Images
  const productsData = [
    // Jardinagem
    {
      name: "Adubo Orgânico Concentrado Húmus de Minhoca 5kg",
      description: "Húmus de minhoca 100% orgânico e puro. Rico em nutrientes essenciais, melhora a estrutura do solo, estimula o enraizamento e proporciona um crescimento saudável para flores, folhagens e hortas domésticas. Ideal para jardinagem geral.",
      shortDesc: "Húmus de minhoca 100% orgânico e puro para o solo do seu jardim.",
      price: 24.90,
      promoPrice: 19.90,
      categoryId: catMap["jardinagem"],
      images: ["https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600"],
      stock: 35,
      unit: "Saco 5kg",
      sku: "JAD-001",
      active: true,
      featured: true,
    },
    {
      name: "Vaso Auto-irrigável Gourmet N03 Verde Floresta",
      description: "Vaso auto-irrigável com sistema de cordões que funcionam como uma espécie de raiz artificial, mantendo a umidade ideal da terra por até 14 dias. Ideal para temperos, hortaliças e plantas ornamentais em apartamentos.",
      shortDesc: "Mantenha suas plantas hidratadas de forma prática e limpa.",
      price: 32.90,
      categoryId: catMap["jardinagem"],
      images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600"],
      stock: 20,
      unit: "Unidade",
      sku: "JAD-002",
      active: true,
      featured: true,
    },
    {
      name: "Pá de Mão Estreita Tramontina em Aço",
      description: "Pá de mão fabricada em aço carbono de alta resistência com cabo ergonômico. Ideal para cavar, remover e transportar terra para plantio de mudas e flores em vasos.",
      shortDesc: "Ferramenta leve e resistente para manejo de mudas e canteiros.",
      price: 15.50,
      categoryId: catMap["jardinagem"],
      images: ["https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=600"],
      stock: 50,
      unit: "Unidade",
      sku: "JAD-003",
      active: true,
      featured: false,
    },

    // Pet Shop
    {
      name: "Ração Premium Especial Cães Adultos Frango e Arroz 15kg",
      description: "Alimento completo de alta performance para cães adultos de médio e grande porte. Rica em proteínas de alto valor biológico, ômegas 3 e 6 para pelos brilhantes, e prebióticos que auxiliam na saúde intestinal.",
      shortDesc: "Alimento completo e balanceado com frango e arroz para cães adultos.",
      price: 189.90,
      promoPrice: 169.90,
      categoryId: catMap["petshop"],
      images: ["https://images.unsplash.com/photo-1589924691106-07416955937c?q=80&w=600"],
      stock: 15,
      unit: "Saco 15kg",
      sku: "PET-001",
      active: true,
      featured: true,
    },
    {
      name: "Antipulgas e Carrapatos Simparic 20mg (Cães 5 a 10kg)",
      description: "Simparic é um comprimido mastigável altamente eficaz contra pulgas, carrapatos e sarnas. Começa a agir rapidamente e mantém a eficácia protetora por até 35 dias com muito sabor para o seu cão.",
      shortDesc: "Comprimido mastigável eficaz contra pulgas, carrapatos e sarnas por 35 dias.",
      price: 94.50,
      categoryId: catMap["petshop"],
      images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600"],
      stock: 45,
      unit: "Caixa 1 Comp.",
      sku: "PET-002",
      active: true,
      featured: true,
    },

    // Agropecuária Geral
    {
      name: "Sal Mineral 80 Fosforo para Bovinos 25kg",
      description: "Suplemento mineral pronto para uso, indicado para bovinos de corte em phase de cria, recria e engorda. Garante o suprimento de fósforo, cálcio e microelementos, prevenindo deficiências e melhorando o rendimento do rebanho.",
      shortDesc: "Suplemento mineral de alta qualidade para nutrição de bovinos de corte.",
      price: 110.00,
      categoryId: catMap["agropecuaria"],
      images: ["https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600"],
      stock: 80,
      unit: "Saco 25kg",
      sku: "AGR-001",
      active: true,
      featured: true,
    },
    {
      name: "Ração para Aves Postura Quibei 20kg",
      description: "Ração balanceada de postura em farelo ou triturada. Formulação especial com cálcio e fósforo nas proporções ideais para garantir cascas de ovos mais resistentes e alta produtividade de postura.",
      shortDesc: "Ração de postura balanceada para galinhas poedeiras de terreiro ou granja.",
      price: 78.00,
      promoPrice: 72.90,
      categoryId: catMap["agropecuaria"],
      images: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=600"],
      stock: 40,
      unit: "Saco 20kg",
      sku: "AGR-002",
      active: true,
      featured: false,
    },

    // Ferramentas e Equipamentos
    {
      name: "Pulverizador Costal Agrícola Guarany 20L",
      description: "Pulverizador costal com bomba de pistão e design ergonômico. Tanque de alta durabilidade e bico regulável. Perfeito para aplicação de defensivos, adubos foliares e herbicidas em plantações e hortas.",
      shortDesc: "Pulverizador de alta durabilidade e bombeamento suave de 20 litros.",
      price: 349.90,
      promoPrice: 319.00,
      categoryId: catMap["ferramentas"],
      images: ["https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600"],
      stock: 8,
      unit: "Unidade",
      sku: "FER-001",
      active: true,
      featured: true,
    },
    {
      name: "Tesoura de Poda Profissional Bypass Tramontina",
      description: "Tesoura de poda bypass com lâmina em aço temperado e cabo emborrachado com amortecedor. Ideal para galhos secos ou verdes de médio diâmetro.",
      shortDesc: "Corte preciso e macio para manutenção de árvores frutíferas e jardins.",
      price: 59.90,
      categoryId: catMap["ferramentas"],
      images: ["https://images.unsplash.com/photo-1598902108854-10e335adac99?q=80&w=600"],
      stock: 25,
      unit: "Unidade",
      sku: "FER-002",
      active: true,
      featured: false,
    },

    // Irrigação
    {
      name: "Mangueira de Jardim Flexível Trançada 1/2' 20 Metros",
      description: "Mangueira de jardim super resistente com tripla camada trançada em nylon. Acompanha bico com jato regulável e adaptadores para torneira. Não dobra e não racha ao sol.",
      shortDesc: "Mangueira de alta durabilidade trançada de 20 metros com esguicho.",
      price: 89.90,
      categoryId: catMap["irrigacao"],
      images: ["https://images.unsplash.com/photo-1558905657-497766e90c74?q=80&w=600"],
      stock: 30,
      unit: "Rolo 20m",
      sku: "IRR-001",
      active: true,
      featured: true,
    },

    // Vestuário e EPI
    {
      name: "Bota de PVC Impermeável Cano Curto Preta Grendene",
      description: "Bota de PVC cano curto impermeável, antiderrapante, ideal para trabalhos em locais úmidos, manuseio de animais, horta e lavagem de instalações rurais. Confortável e de fácil limpeza.",
      shortDesc: "Bota de borracha impermeável cano curto, segura e antiderrapante.",
      price: 49.90,
      categoryId: catMap["vestuario-epi"],
      images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600"],
      stock: 22,
      unit: "Par",
      sku: "EPI-001",
      active: true,
      featured: false,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: prod,
      create: prod,
    });
  }

  console.log("Seeded database successfully with stock images!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
