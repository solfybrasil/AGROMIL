export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  displayOrder: number;
}

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  price: number;
  promoPrice: number | null;
  categoryId: string;
  images: string[];
  stock: number;
  unit: string;
  sku: string;
  active: boolean;
  featured: boolean;
}

export interface MockOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "NEW" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  notes: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product?: MockProduct;
  }>;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "cat-jardinagem", name: "Jardinagem & Vasos", slug: "jardinagem", imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600", displayOrder: 1 },
  { id: "cat-petshop", name: "Rações & Petshop", slug: "petshop", imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600", displayOrder: 2 },
  { id: "cat-agropecuaria", name: "Agropecuária Geral", slug: "agropecuaria", imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=600", displayOrder: 3 },
  { id: "cat-ferramentas", name: "Ferramentas & Equipamentos", slug: "ferramentas", imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600", displayOrder: 4 },
  { id: "cat-irrigacao", name: "Irrigação & Bombas", slug: "irrigacao", imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600", displayOrder: 5 },
  { id: "cat-vestuario-epi", name: "Vestuário & EPI", slug: "vestuario-epi", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600", displayOrder: 6 }
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod-jar-001",
    name: "Adubo Orgânico Premium 1kg",
    description: "Adubo 100% natural compostável, rico em matéria orgânica para hortas, jardins e vasos.",
    shortDesc: "Adubo orgânico para solo saudável",
    price: 24.90,
    promoPrice: 19.90,
    categoryId: "cat-jardinagem",
    images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"],
    stock: 120,
    unit: "kg",
    sku: "JAR-001",
    active: true,
    featured: true
  },
  {
    id: "prod-jar-002",
    name: "Vaso de Cerâmica 30cm",
    description: "Vaso decorativo de cerâmica esmaltada, ideal para plantas ornamentais e suculentas.",
    shortDesc: "Vaso cerâmico 30cm com drenagem",
    price: 39.90,
    promoPrice: 34.90,
    categoryId: "cat-jardinagem",
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600"],
    stock: 60,
    unit: "unidade",
    sku: "JAR-002",
    active: true,
    featured: true
  },
  {
    id: "prod-pet-001",
    name: "Ração Golden Cães Adultos 15kg",
    description: "Ração premium para cães adultos, com frango e arroz. Nutrição completa e balanceada.",
    shortDesc: "Ração cães adultos 15kg",
    price: 189.90,
    promoPrice: 169.90,
    categoryId: "cat-petshop",
    images: ["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600"],
    stock: 60,
    unit: "kg",
    sku: "PET-001",
    active: true,
    featured: true
  },
  {
    id: "prod-pet-002",
    name: "Ração Whiskas Gatos 10kg",
    description: "Ração seca para gatos adultos, sabor peixe. Pelletes crocantes para saúde bucal.",
    shortDesc: "Ração gatos 10kg",
    price: 159.90,
    promoPrice: 139.90,
    categoryId: "cat-petshop",
    images: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600"],
    stock: 55,
    unit: "kg",
    sku: "PET-002",
    active: true,
    featured: true
  },
  {
    id: "prod-agr-001",
    name: "Sal Mineral Bovino 25kg",
    description: "Sal mineralizado completo para bovinos de corte e leite.",
    shortDesc: "Sal mineral bovino 25kg",
    price: 89.90,
    promoPrice: 79.90,
    categoryId: "cat-agropecuaria",
    images: ["https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=600"],
    stock: 30,
    unit: "kg",
    sku: "AGR-001",
    active: true,
    featured: true
  },
  {
    id: "prod-fer-001",
    name: "Furadeira de Impacto 550W",
    description: "Furadeira de impacto 550W com empunhadura emborrachada e mandril 13mm.",
    shortDesc: "Furadeira impacto 550W",
    price: 199.90,
    promoPrice: 179.90,
    categoryId: "cat-ferramentas",
    images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600"],
    stock: 25,
    unit: "unidade",
    sku: "FER-001",
    active: true,
    featured: true
  },
  {
    id: "prod-iri-001",
    name: "Mangueira Gotejadora 30m",
    description: "Mangueira porosa de 30m para gotejamento em horta e canteiro.",
    shortDesc: "Mangueira gotejadora 30m",
    price: 89.90,
    promoPrice: 79.90,
    categoryId: "cat-irrigacao",
    images: ["https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"],
    stock: 30,
    unit: "unidade",
    sku: "IRI-001",
    active: true,
    featured: true
  },
  {
    id: "prod-epi-001",
    name: "Bota de Segurança NR 35",
    description: "Bota de segurança com biqueira de aço, solado anti-impacto e antiderrapante.",
    shortDesc: "Bota segurança NR35",
    price: 159.90,
    promoPrice: 139.90,
    categoryId: "cat-vestuario-epi",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"],
    stock: 40,
    unit: "par",
    sku: "EPI-001",
    active: true,
    featured: true
  }
];

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ORD-1001",
    clientName: "João Silva",
    clientPhone: "(11) 99999-8888",
    clientEmail: "joao@email.com",
    street: "Av. Paulista",
    number: "1000",
    complement: "Apto 52",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    paymentMethod: "PIX",
    subtotal: 214.80,
    deliveryFee: 15.00,
    total: 229.80,
    status: "PREPARING",
    notes: "Entregar em horário comercial",
    createdAt: new Date().toISOString(),
    items: [
      {
        id: "item-1",
        productId: "prod-jar-001",
        quantity: 2,
        price: 19.90,
        product: MOCK_PRODUCTS[0]
      },
      {
        id: "item-2",
        productId: "prod-pet-001",
        quantity: 1,
        price: 169.90,
        product: MOCK_PRODUCTS[2]
      }
    ]
  }
];
