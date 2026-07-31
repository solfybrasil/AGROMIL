import { db } from "../src/lib/supabase";

const CATEGORIES = [
  { id: "cat-jardinagem", name: "Jardinagem & Vasos", slug: "jardinagem", displayOrder: 1, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600" },
  { id: "cat-petshop", name: "Rações & Acessórios Pet", slug: "petshop", displayOrder: 2, imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600" },
  { id: "cat-agropecuaria", name: "Agropecuária Geral", slug: "agropecuaria", displayOrder: 3, imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=600" },
  { id: "cat-ferramentas", name: "Ferramentas & Equipamentos", slug: "ferramentas", displayOrder: 4, imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600" },
  { id: "cat-irrigacao", name: "Irrigação & Bombas", slug: "irrigacao", displayOrder: 5, imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600" },
  { id: "cat-vestuario-epi", name: "Vestuário & EPI", slug: "vestuario-epi", displayOrder: 6, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600" }
];

const PRODUCTS = [
  // Jardinagem
  { id: "prod-jar-001", name: "Adubo Orgânico Premium 1kg", description: "Adubo 100% natural compostável, rico em matéria orgânica para hortas e jardins.", shortDesc: "Adubo orgânico para solo saudável", price: 24.90, promoPrice: 19.90, categoryId: "cat-jardinagem", images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"], stock: 120, unit: "kg", sku: "JAR-001", active: true, featured: true },
  { id: "prod-jar-002", name: "Vaso de Cerâmica 30cm", description: "Vaso decorativo de cerâmica esmaltada, ideal para plantas ornamentais e suculentas.", shortDesc: "Vaso cerâmico 30cm com drenagem", price: 39.90, promoPrice: 34.90, categoryId: "cat-jardinagem", images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600"], stock: 60, unit: "unidade", sku: "JAR-002", active: true, featured: true },
  { id: "prod-jar-003", name: "Tesoura de Poda Aço Inox", description: "Tesoura de poda ergonômica com lâminas em aço inox forjado. Corte preciso.", shortDesc: "Tesoura poda aço inox", price: 49.90, promoPrice: null, categoryId: "cat-jardinagem", images: ["https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=600"], stock: 80, unit: "unidade", sku: "JAR-003", active: true, featured: false },
  { id: "prod-jar-004", name: "Mangueira de Jardim 15m", description: "Mangueira flexível de 15 metros com conexões reforçadas. Resiste a pressão.", shortDesc: "Mangueira 15m reforçada", price: 59.90, promoPrice: 49.90, categoryId: "cat-jardinagem", images: ["https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"], stock: 40, unit: "unidade", sku: "JAR-004", active: true, featured: true },

  // Pet Shop
  { id: "prod-pet-001", name: "Ração Golden Cães Adultos 15kg", description: "Ração premium para cães adultos, com frango e arroz. Nutrição completa.", shortDesc: "Ração cães adultos 15kg", price: 189.90, promoPrice: 169.90, categoryId: "cat-petshop", images: ["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600"], stock: 60, unit: "kg", sku: "PET-001", active: true, featured: true },
  { id: "prod-pet-002", name: "Ração Whiskas Gatos 10kg", description: "Ração seca para gatos adultos, sabor peixe. Pelletes crocantes.", shortDesc: "Ração gatos 10kg", price: 159.90, promoPrice: 139.90, categoryId: "cat-petshop", images: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600"], stock: 55, unit: "kg", sku: "PET-002", active: true, featured: true },
  { id: "prod-pet-003", name: "Cama Pet Conforto M", description: "Cama macia anti-alérgica tamanho M, com enchimento memory e capa lavável.", shortDesc: "Cama pet tamanho M", price: 79.90, promoPrice: 69.90, categoryId: "cat-petshop", images: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600"], stock: 40, unit: "unidade", sku: "PET-003", active: true, featured: false },

  // Agropecuária
  { id: "prod-agr-001", name: "Sal Mineral Bovino 25kg", description: "Sal mineralizado completo para bovinos de corte e leite.", shortDesc: "Sal mineral bovino 25kg", price: 89.90, promoPrice: 79.90, categoryId: "cat-agropecuaria", images: ["https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=600"], stock: 30, unit: "kg", sku: "AGR-001", active: true, featured: true },
  { id: "prod-agr-002", name: "Ração Poedeira 30kg", description: "Ração balanceada para galinhas poedeiras, com cálcio para casca forte.", shortDesc: "Ração poedeira 30kg", price: 119.90, promoPrice: 109.90, categoryId: "cat-agropecuaria", images: ["https://images.unsplash.com/photo-1548550023-2bdb3c1422e1?q=80&w=600"], stock: 40, unit: "kg", sku: "AGR-002", active: true, featured: true },
  { id: "prod-agr-003", name: "Milho Grão 20kg", description: "Milho grão seco de alta qualidade para aves e suínos.", shortDesc: "Milho grão 20kg", price: 69.90, promoPrice: null, categoryId: "cat-agropecuaria", images: ["https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600"], stock: 50, unit: "kg", sku: "AGR-003", active: true, featured: false },

  // Ferramentas
  { id: "prod-fer-001", name: "Furadeira de Impacto 550W", description: "Furadeira de impacto 550W com empunhadura emborrachada e mandril 13mm.", shortDesc: "Furadeira impacto 550W", price: 199.90, promoPrice: 179.90, categoryId: "cat-ferramentas", images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600"], stock: 25, unit: "unidade", sku: "FER-001", active: true, featured: true },
  { id: "prod-fer-002", name: "Jogo de Chaves Phillips 6pcs", description: "Conjunto com 6 chaves de fenda Phillips e planas, aço cromo vanádio.", shortDesc: "Chaves 6pcs", price: 39.90, promoPrice: null, categoryId: "cat-ferramentas", images: ["https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600"], stock: 70, unit: "kit", sku: "FER-002", active: true, featured: false },
  { id: "prod-fer-003", name: "Furadeira Parafusadeira 12V", description: "Furadeira a bateria 12V com 2 baterias e carregador. Leve e prática.", shortDesc: "Furadeira 12V bateria", price: 249.90, promoPrice: 219.90, categoryId: "cat-ferramentas", images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600"], stock: 18, unit: "kit", sku: "FER-003", active: true, featured: true },

  // Irrigação
  { id: "prod-iri-001", name: "Mangueira Gotejadora 30m", description: "Mangueira porosa de 30m para gotejamento em horta e canteiro.", shortDesc: "Mangueira gotejadora 30m", price: 89.90, promoPrice: 79.90, categoryId: "cat-irrigacao", images: ["https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"], stock: 30, unit: "unidade", sku: "IRI-001", active: true, featured: true },
  { id: "prod-iri-002", name: "Asperador de Jardim 360°", description: "Asperador rotativo 360 graus, alcance até 8m. Cobertura uniforme.", shortDesc: "Asperador 360", price: 34.90, promoPrice: null, categoryId: "cat-irrigacao", images: ["https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"], stock: 60, unit: "unidade", sku: "IRI-002", active: true, featured: false },

  // Vestuário & EPI
  { id: "prod-epi-001", name: "Bota de Segurança NR 35", description: "Bota de segurança com biqueira de aço, solado anti-impacto e antiderrapante.", shortDesc: "Bota segurança NR35", price: 159.90, promoPrice: 139.90, categoryId: "cat-vestuario-epi", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"], stock: 40, unit: "par", sku: "EPI-001", active: true, featured: true },
  { id: "prod-epi-002", name: "Luvas de Couro Rústica", description: "Luvas de raspa de couro para manuseio de ferramentas e roçada.", shortDesc: "Luvas couro", price: 24.90, promoPrice: null, categoryId: "cat-vestuario-epi", images: ["https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"], stock: 90, unit: "par", sku: "EPI-002", active: true, featured: false }
];

async function seed() {
  if (!db) {
    console.error("No Supabase client!");
    return;
  }
  console.log("Seeding Agromil categories...");
  for (const c of CATEGORIES) {
    const { error } = await db.from("Category").upsert({
      id: c.id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.displayOrder,
      imageUrl: c.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { onConflict: "id" });
    if (error) console.error("Cat error:", error);
  }

  console.log("Seeding Agromil products...");
  for (const p of PRODUCTS) {
    const { error } = await db.from("Product").upsert({
      id: p.id,
      name: p.name,
      description: p.description,
      shortDesc: p.shortDesc,
      price: p.price,
      promoPrice: p.promoPrice,
      categoryId: p.categoryId,
      images: p.images,
      stock: p.stock,
      unit: p.unit,
      sku: p.sku,
      active: p.active,
      featured: p.featured,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { onConflict: "id" });
    if (error) console.error("Prod error:", error);
  }

  console.log("✅ Agromil seeding completed successfully!");
}

seed();
