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
  {
    id: "cat-vestidos",
    name: "Vestidos & Midis",
    slug: "vestidos",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
    displayOrder: 1,
  },
  {
    id: "cat-tops-blusas",
    name: "Tops & Croppeds",
    slug: "tops-blusas",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600",
    displayOrder: 2,
  },
  {
    id: "cat-conjuntos",
    name: "Conjuntos Alfaiataria",
    slug: "conjuntos",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600",
    displayOrder: 3,
  },
  {
    id: "cat-calcas-jeans",
    name: "Calças Wide Leg & Jeans",
    slug: "calcas-jeans",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600",
    displayOrder: 4,
  },
  {
    id: "cat-acessorios",
    name: "Bolsas & Acessórios",
    slug: "acessorios",
    imageUrl: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=600",
    displayOrder: 5,
  },
  {
    id: "cat-casacos-blazers",
    name: "Casacos & Blazers",
    slug: "casacos-blazers",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600",
    displayOrder: 6,
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "sil-1",
    name: "Vestido Midi Canelado Nude Silk",
    description: "Vestido midi de toque macio e acabamento canelado nobre. Possui caimento fluido que se ajusta com elegância ao corpo, ideal para ocasiões formais ou composições diárias refinadas.",
    shortDesc: "Vestido midi de caimento fluido e toque macio em linho e seda.",
    price: 289.90,
    promoPrice: 249.90,
    categoryId: "cat-vestidos",
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800"],
    stock: 18,
    unit: "Peça",
    sku: "SIL-001",
    active: true,
    featured: true,
  },
  {
    id: "sil-2",
    name: "Conjunto Alfaiataria Linho Puro Sálvia",
    description: "Conjunto de cropped e calça reta em linho puro com tonalidade sálvia. Corte ergonômico e costuras estruturadas de alta costura.",
    shortDesc: "Conjunto de alta costura em linho puro sálvia.",
    price: 459.90,
    promoPrice: 399.90,
    categoryId: "cat-conjuntos",
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800"],
    stock: 12,
    unit: "Conjunto",
    sku: "SIL-002",
    active: true,
    featured: true,
  },
  {
    id: "sil-3",
    name: "Top Cropped Decote Coração Off-White",
    description: "Top cropped confeccionado em crepe nobre com decote coração e alças estruturadas. Peça versátil para combinações de alfaiataria.",
    shortDesc: "Top cropped decote coração em crepe nobre.",
    price: 149.90,
    promoPrice: null,
    categoryId: "cat-tops-blusas",
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800"],
    stock: 25,
    unit: "Peça",
    sku: "SIL-003",
    active: true,
    featured: false,
  },
  {
    id: "sil-4",
    name: "Calça Wide Leg Cintura Alta Caramelo",
    description: "Calça wide leg de cintura alta confeccionada em sarja nobre com caimento amplo e passantes para cinto. Elegância atemporal para o dia a dia.",
    shortDesc: "Calça wide leg cintura alta em sarja caramelo.",
    price: 299.90,
    promoPrice: null,
    categoryId: "cat-calcas-jeans",
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800"],
    stock: 15,
    unit: "Peça",
    sku: "SIL-004",
    active: true,
    featured: true,
  },
  {
    id: "sil-5",
    name: "Blazer Estruturado Botões Dourados Preto",
    description: "Blazer de alfaiataria fina com ombreiras suaves, lapela chanfrada e botões metálicos com banho dourado. Um clássico indispensável.",
    shortDesc: "Blazer estruturado com botões dourados em alfaiataria fina.",
    price: 389.90,
    promoPrice: null,
    categoryId: "cat-casacos-blazers",
    images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800"],
    stock: 8,
    unit: "Peça",
    sku: "SIL-005",
    active: true,
    featured: true,
  },
  {
    id: "sil-6",
    name: "Bolsa Baguette Couro Legítimo Terracota",
    description: "Bolsa baguette em couro legítimo macio com fivela minimalista banhada a ouro. Alça ajustável de ombro e compartimentos internos.",
    shortDesc: "Bolsa baguette autoral em couro legítimo terracota.",
    price: 329.90,
    promoPrice: 289.90,
    categoryId: "cat-acessorios",
    images: ["https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=800"],
    stock: 10,
    unit: "Unidade",
    sku: "SIL-006",
    active: true,
    featured: true,
  },
  {
    id: "sil-7",
    name: "Vestido Longo Evasê Seda Natural Nude",
    description: "Vestido longo fluido com decote sutil em V e saia evasê. Confeccionado em seda pura com toque suave e acabamento acetinado.",
    shortDesc: "Vestido longo fluido em seda pura de acabamento acetinado.",
    price: 529.90,
    promoPrice: null,
    categoryId: "cat-vestidos",
    images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800"],
    stock: 6,
    unit: "Peça",
    sku: "SIL-007",
    active: true,
    featured: true,
  },
  {
    id: "sil-8",
    name: "Cinto Fivela Minimalista Ouro Velho",
    description: "Cinto feminino em couro macio cor café com fivela circular minimalista com acabamento vintage ouro velho.",
    shortDesc: "Cinto em couro autêntico com fivela minimalista ouro velho.",
    price: 119.90,
    promoPrice: null,
    categoryId: "cat-acessorios",
    images: ["https://images.unsplash.com/photo-1624222247344-550fb8ec5522?q=80&w=800"],
    stock: 30,
    unit: "Unidade",
    sku: "SIL-008",
    active: true,
    featured: false,
  },
  {
    id: "sil-9",
    name: "Macacão Pantalona Linho Nude",
    description: "Macacão longo modelo pantalona confeccionado em linho misto com decote reto e faixa ajustável na cintura.",
    shortDesc: "Macacão pantalona elegante em linho misto nude.",
    price: 389.90,
    promoPrice: 349.90,
    categoryId: "cat-conjuntos",
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800"],
    stock: 9,
    unit: "Peça",
    sku: "SIL-009",
    active: true,
    featured: true,
  },
  {
    id: "sil-10",
    name: "Saia Midi Plissada Acetinada Champagne",
    description: "Saia midi com efeito plissado permanente e acabamento acetinado brilhante. Cós elástico confortável para combinações sofisticadas.",
    shortDesc: "Saia midi plissada em tecido acetinado champagne.",
    price: 259.90,
    promoPrice: null,
    categoryId: "cat-vestidos",
    images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800"],
    stock: 14,
    unit: "Peça",
    sku: "SIL-010",
    active: true,
    featured: false,
  },
  {
    id: "sil-11",
    name: "Blusa Manga Bufante Seda Pura Off-White",
    description: "Blusa feminina em seda pura com mangas levemente bufantes e gola alta delicada com botões traseiros encapados.",
    shortDesc: "Blusa com manga bufante em seda pura off-white.",
    price: 219.90,
    promoPrice: null,
    categoryId: "cat-tops-blusas",
    images: ["https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800"],
    stock: 20,
    unit: "Peça",
    sku: "SIL-011",
    active: true,
    featured: true,
  },
  {
    id: "sil-12",
    name: "Trench Coat Algodão Impermeável Bege",
    description: "Trench coat clássico de abotoamento duplo em sarja de algodão de alta densidade. Possui cinto fivelado e bolsos embutidos.",
    shortDesc: "Trench coat abotoamento duplo em algodão impermeável.",
    price: 599.90,
    promoPrice: 539.90,
    categoryId: "cat-casacos-blazers",
    images: ["https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800"],
    stock: 5,
    unit: "Peça",
    sku: "SIL-012",
    active: true,
    featured: true,
  },
  {
    id: "sil-13",
    name: "Calça Reta Alfaiataria Risca de Giz",
    description: "Calça social reta em padronagem clássica risca de giz sobre fundo preto. Bolsos faca funcionais e vinco acentuado.",
    shortDesc: "Calça reta em alfaiataria fina risca de giz.",
    price: 319.90,
    promoPrice: null,
    categoryId: "cat-calcas-jeans",
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800"],
    stock: 11,
    unit: "Peça",
    sku: "SIL-013",
    active: true,
    featured: false,
  },
  {
    id: "sil-14",
    name: "Sandália Salto Bloco Couro Nude",
    description: "Sandália em couro legítimo cor nude com salto bloco médio ergonômico de 6cm. Tiras finas delicadas e fechamento por fivela no tornozelo.",
    shortDesc: "Sandália em couro legítimo com salto bloco ergonômico.",
    price: 279.90,
    promoPrice: null,
    categoryId: "cat-acessorios",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"],
    stock: 16,
    unit: "Par",
    sku: "SIL-014",
    active: true,
    featured: true,
  },
  {
    id: "sil-15",
    name: "Vestido Envelope Estampa Botânica",
    description: "Vestido transpassado modelo envelope com amarração lateral e estampa botânica autoral em tons terrosos.",
    shortDesc: "Vestido envelope transpassado com estampa botânica.",
    price: 349.90,
    promoPrice: 299.90,
    categoryId: "cat-vestidos",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800"],
    stock: 13,
    unit: "Peça",
    sku: "SIL-015",
    active: true,
    featured: true,
  },
  {
    id: "sil-16",
    name: "Top Corset Estruturado Preto",
    description: "Top modelo corset com barbatanas flexíveis embutidas que delineiam o busto com alta sustentação e acabamento em viscolinho.",
    shortDesc: "Top corset estruturado com barbatanas em viscolinho.",
    price: 179.90,
    promoPrice: null,
    categoryId: "cat-tops-blusas",
    images: ["https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=800"],
    stock: 22,
    unit: "Peça",
    sku: "SIL-016",
    active: true,
    featured: false,
  },
];

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "SIL-8492",
    clientName: "Helena Silveira",
    clientPhone: "(11) 99887-6655",
    clientEmail: "helena.silveira@email.com",
    street: "Alameda Santos",
    number: "1420",
    complement: "Apto 102",
    neighborhood: "Jardins",
    city: "São Paulo",
    state: "SP",
    zipCode: "01418-100",
    paymentMethod: "PIX",
    subtotal: 539.80,
    deliveryFee: 0.00,
    total: 539.80,
    status: "CONFIRMED",
    notes: "Embalar para presente",
    createdAt: "2026-07-31T10:15:00Z",
    items: [
      {
        id: "oi-1",
        productId: "sil-1",
        quantity: 1,
        price: 249.90,
        product: MOCK_PRODUCTS[0],
      },
      {
        id: "oi-2",
        productId: "sil-6",
        quantity: 1,
        price: 289.90,
        product: MOCK_PRODUCTS[5],
      },
    ],
  },
  {
    id: "SIL-8491",
    clientName: "Camila Rocha",
    clientPhone: "(11) 98765-4321",
    clientEmail: "camila.rocha@email.com",
    street: "Rua Oscar Freire",
    number: "890",
    complement: null,
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    zipCode: "05409-011",
    paymentMethod: "Cartão de Crédito",
    subtotal: 289.90,
    deliveryFee: 0.00,
    total: 289.90,
    status: "PREPARING",
    notes: null,
    createdAt: "2026-07-31T09:30:00Z",
    items: [
      {
        id: "oi-3",
        productId: "sil-1",
        quantity: 1,
        price: 289.90,
        product: MOCK_PRODUCTS[0],
      },
    ],
  },
  {
    id: "SIL-8490",
    clientName: "Juliana Mendonça",
    clientPhone: "(19) 99123-8877",
    clientEmail: "juliana.mendonca@email.com",
    street: "Av. José de Souza",
    number: "305",
    complement: "Bloco B",
    neighborhood: "Cambuí",
    city: "Campinas",
    state: "SP",
    zipCode: "13025-000",
    paymentMethod: "PIX",
    subtotal: 749.80,
    deliveryFee: 0.00,
    total: 749.80,
    status: "SHIPPED",
    notes: "Entregar em mãos",
    createdAt: "2026-07-30T16:45:00Z",
    items: [
      {
        id: "oi-4",
        productId: "sil-2",
        quantity: 1,
        price: 399.90,
        product: MOCK_PRODUCTS[1],
      },
      {
        id: "oi-5",
        productId: "sil-4",
        quantity: 1,
        price: 299.90,
        product: MOCK_PRODUCTS[3],
      },
    ],
  },
  {
    id: "SIL-8489",
    clientName: "Mariana Castro",
    clientPhone: "(11) 97112-3344",
    clientEmail: "mariana.castro@email.com",
    street: "Rua Haddock Lobo",
    number: "500",
    complement: null,
    neighborhood: "Cerqueira César",
    city: "São Paulo",
    state: "SP",
    zipCode: "01414-001",
    paymentMethod: "Cartão de Crédito",
    subtotal: 329.90,
    deliveryFee: 0.00,
    total: 329.90,
    status: "DELIVERED",
    notes: null,
    createdAt: "2026-07-29T14:20:00Z",
    items: [
      {
        id: "oi-6",
        productId: "sil-6",
        quantity: 1,
        price: 329.90,
        product: MOCK_PRODUCTS[5],
      },
    ],
  },
];
