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
    id: "cat-jardinagem",
    name: "Jardinagem & Vasos",
    slug: "jardinagem",
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600",
    displayOrder: 1,
  },
  {
    id: "cat-petshop",
    name: "Rações & Acessórios Pet",
    slug: "petshop",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600",
    displayOrder: 2,
  },
  {
    id: "cat-agropecuaria",
    name: "Agropecuária Geral",
    slug: "agropecuaria",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600",
    displayOrder: 3,
  },
  {
    id: "cat-ferramentas",
    name: "Ferramentas & Equipamentos",
    slug: "ferramentas",
    imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600",
    displayOrder: 4,
  },
  {
    id: "cat-irrigacao",
    name: "Irrigação",
    slug: "irrigacao",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600",
    displayOrder: 5,
  },
  {
    id: "cat-vestuario-epi",
    name: "Vestuário & EPI",
    slug: "vestuario-epi",
    imageUrl: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600",
    displayOrder: 6,
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "m-1",
    name: "Adubo Orgânico Concentrado Húmus de Minhoca 5kg",
    description: "Húmus de minhoca 100% orgânico e puro. Rico em nutrientes essenciais, melhora a estrutura do solo, estimula o enraizamento e aumenta a produtividade das plantas. Perfeito para hortas, jardins, vasos e pomares.",
    shortDesc: "Húmus de minhoca 100% orgânico e puro para o solo do seu jardim.",
    price: 24.90,
    promoPrice: 19.90,
    categoryId: "cat-jardinagem",
    images: ["https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600"],
    stock: 35,
    unit: "Saco 5kg",
    sku: "JAD-001",
    active: true,
    featured: true,
  },
  {
    id: "m-2",
    name: "Vaso Auto-irrigável Gourmet N03 Verde Floresta",
    description: "Vaso auto-irrigável com sistema de cordões que funcionam como uma espécie de raiz artificial, mantendo a umidade ideal da terra por até 14 dias. Ideal para temperos e hortaliças dentro de casa de forma limpa e prática.",
    shortDesc: "Mantenha suas plantas hidratadas de forma prática e limpa.",
    price: 32.90,
    promoPrice: null,
    categoryId: "cat-jardinagem",
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600"],
    stock: 20,
    unit: "Unidade",
    sku: "JAD-002",
    active: true,
    featured: true,
  },
  {
    id: "m-3",
    name: "Pá de Mão Estreita Tramontina em Aço",
    description: "Pá de mão fabricada em aço carbono de alta resistência com pintura eletrostática a pó e cabo ergonômico. Ideal para cavar, remover e transportar terra em trabalhos de plantio e transplante de mudas.",
    shortDesc: "Ferramenta leve e resistente para manejo de mudas e canteiros.",
    price: 15.50,
    promoPrice: null,
    categoryId: "cat-jardinagem",
    images: ["https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=600"],
    stock: 50,
    unit: "Unidade",
    sku: "JAD-003",
    active: true,
    featured: false,
  },
  {
    id: "m-4",
    name: "Ração Premium Especial Cães Adultos Frango e Arroz 15kg",
    description: "Alimento completo de alta performance para cães adultos de médio e grande porte. Rica em proteínas de alto valor biológico, fibras naturais, ômegas 3 e 6 para pelos brilhantes e saúde das articulações.",
    shortDesc: "Alimento completo e balanceado com frango e arroz para cães adultos.",
    price: 189.90,
    promoPrice: 169.90,
    categoryId: "cat-petshop",
    images: ["https://images.unsplash.com/photo-1589924691106-07416955937c?q=80&w=600"],
    stock: 15,
    unit: "Saco 15kg",
    sku: "PET-001",
    active: true,
    featured: true,
  },
  {
    id: "m-5",
    name: "Antipulgas e Carrapatos Simparic 20mg (Cães 5 a 10kg)",
    description: "Simparic é um comprimido mastigável altamente eficaz contra pulgas, carrapatos e sarnas em cães de pequeno/médio porte. Mantém a eficácia protetora de forma constante por até 35 dias com ação rápida.",
    shortDesc: "Comprimido mastigável eficaz contra pulgas, carrapatos e sarnas por 35 dias.",
    price: 94.50,
    promoPrice: null,
    categoryId: "cat-petshop",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600"],
    stock: 45,
    unit: "Caixa 1 Comp.",
    sku: "PET-002",
    active: true,
    featured: true,
  },
  {
    id: "m-6",
    name: "Sal Mineral 80 Fosforo para Bovinos 25kg",
    description: "Suplemento mineral pronto para uso, indicado para bovinos de corte em fase de cria, recria e engorda. Garante o suprimento adequado de fósforo e demais micro e macro minerais essenciais para o gado.",
    shortDesc: "Suplemento mineral de alta qualidade para nutrição de bovinos de corte.",
    price: 110.00,
    promoPrice: null,
    categoryId: "cat-agropecuaria",
    images: ["https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600"],
    stock: 80,
    unit: "Saco 25kg",
    sku: "AGR-001",
    active: true,
    featured: true,
  },
  {
    id: "m-7",
    name: "Ração para Aves Postura Quibei 20kg",
    description: "Ração balanceada de postura em farelo ou triturada. Formulação especial com cálcio e fósforo nas proporções ideais para garantir cascas de ovos resistentes, gemas avermelhadas e alta taxa de postura diária.",
    shortDesc: "Ração de postura balanceada para galinhas poedeiras de terreiro ou granja.",
    price: 78.00,
    promoPrice: 72.90,
    categoryId: "cat-agropecuaria",
    images: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=600"],
    stock: 40,
    unit: "Saco 20kg",
    sku: "AGR-002",
    active: true,
    featured: false,
  },
  {
    id: "m-8",
    name: "Pulverizador Costal Agrícola Guarany 20L",
    description: "Pulverizador costal com bomba de pistão e design ergonômico. Tanque de alta durabilidade, bico regulável e mangueira reforçada. Perfeito para aplicação de defensivos e fertilizantes em plantações médias.",
    shortDesc: "Pulverizador de alta durabilidade e bombeamento suave de 20 litros.",
    price: 349.90,
    promoPrice: 319.00,
    categoryId: "cat-ferramentas",
    images: ["https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600"],
    stock: 8,
    unit: "Unidade",
    sku: "FER-001",
    active: true,
    featured: true,
  },
  {
    id: "m-9",
    name: "Tesoura de Poda Profissional Bypass Tramontina",
    description: "Tesoura de poda bypass com lâmina em aço temperado de alta qualidade, trava de segurança e cabo emborrachado com amortecedor. Ideal para galhos secos ou verdes, garantindo cortes precisos sem ferir a planta.",
    shortDesc: "Corte preciso e macio para manutenção de árvores frutíferas e jardins.",
    price: 59.90,
    promoPrice: null,
    categoryId: "cat-ferramentas",
    images: ["https://images.unsplash.com/photo-1598902108854-10e335adac99?q=80&w=600"],
    stock: 25,
    unit: "Unidade",
    sku: "FER-002",
    active: true,
    featured: false,
  },
  {
    id: "m-10",
    name: "Mangueira de Jardim Flexível Trançada 1/2' 20 Metros",
    description: "Mangueira de jardim super resistente com tripla camada trançada em nylon e PVC. Acompanha esguicho com jato regulável, adaptadores de engate rápido e suporte de parede. Não dobra e não obstrui o fluxo de água.",
    shortDesc: "Mangueira de alta durabilidade trançada de 20 metros com esguicho.",
    price: 89.90,
    promoPrice: null,
    categoryId: "cat-irrigacao",
    images: ["https://images.unsplash.com/photo-1558905657-497766e90c74?q=80&w=600"],
    stock: 30,
    unit: "Rolo 20m",
    sku: "IRR-001",
    active: true,
    featured: true,
  },
  {
    id: "m-11",
    name: "Bota de PVC Impermeável Cano Curto Preta Grendene",
    description: "Bota de PVC de cano curto impermeável, antiderrapante de alta aderência, com forro interno. Ideal para trabalhos em locais úmidos, manuseio de água, hortas, ordenhas e lavagem de instalações rurais e domésticas.",
    shortDesc: "Bota de borracha impermeável cano curto, segura e antiderrapante.",
    price: 49.90,
    promoPrice: null,
    categoryId: "cat-vestuario-epi",
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600"],
    stock: 22,
    unit: "Par",
    sku: "EPI-001",
    active: true,
    featured: false,
  },
];

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "PED-9871",
    clientName: "Leonardo de Oliveira",
    clientPhone: "(11) 98888-7777",
    clientEmail: "leonardo@email.com",
    street: "Av. Tiradentes",
    number: "1250",
    complement: "Apto 42",
    neighborhood: "Centro",
    city: "Itu",
    state: "SP",
    zipCode: "13300-000",
    paymentMethod: "pix",
    subtotal: 52.80,
    deliveryFee: 10.00,
    total: 62.80,
    status: "NEW",
    notes: "Entregar na portaria por favor.",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 min ago
    items: [
      {
        id: "item-1",
        productId: "m-1",
        quantity: 1,
        price: 19.90,
        product: MOCK_PRODUCTS[0],
      },
      {
        id: "item-2",
        productId: "m-2",
        quantity: 1,
        price: 32.90,
        product: MOCK_PRODUCTS[1],
      },
    ],
  },
  {
    id: "PED-9870",
    clientName: "Mariana Silva",
    clientPhone: "(11) 97777-6666",
    clientEmail: null,
    street: "Rua Floriano Peixoto",
    number: "45",
    complement: null,
    neighborhood: "Vila Nova",
    city: "Itu",
    state: "SP",
    zipCode: "13309-000",
    paymentMethod: "credito_entrega",
    subtotal: 189.90,
    deliveryFee: 15.00,
    total: 204.90,
    status: "CONFIRMED",
    notes: "Ligar antes de chegar.",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    items: [
      {
        id: "item-3",
        productId: "m-4",
        quantity: 1,
        price: 189.90,
        product: MOCK_PRODUCTS[3],
      },
    ],
  },
  {
    id: "PED-9869",
    clientName: "Roberto Alencar",
    clientPhone: "(11) 96666-5555",
    clientEmail: "roberto@yahoo.com",
    street: "Rua Santa Rita",
    number: "982",
    complement: "Casa B",
    neighborhood: "Liberdade",
    city: "Itu",
    state: "SP",
    zipCode: "13301-100",
    paymentMethod: "dinheiro",
    subtotal: 110.00,
    deliveryFee: 12.00,
    total: 122.00,
    status: "PREPARING",
    notes: "Troco para R$ 150,00",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    items: [
      {
        id: "item-4",
        productId: "m-6",
        quantity: 1,
        price: 110.00,
        product: MOCK_PRODUCTS[5],
      },
    ],
  },
  {
    id: "PED-9868",
    clientName: "Clara Medeiros",
    clientPhone: "(11) 95555-4444",
    clientEmail: "clara@gmail.com",
    street: "Rua Maestro Elias Lobo",
    number: "331",
    complement: null,
    neighborhood: "Brasil",
    city: "Itu",
    state: "SP",
    zipCode: "13301-200",
    paymentMethod: "pix",
    subtotal: 179.80,
    deliveryFee: 10.00,
    total: 189.80,
    status: "DELIVERED",
    notes: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 24 hours ago
    items: [
      {
        id: "item-5",
        productId: "m-10",
        quantity: 2,
        price: 89.90,
        product: MOCK_PRODUCTS[9],
      },
    ],
  },
];
