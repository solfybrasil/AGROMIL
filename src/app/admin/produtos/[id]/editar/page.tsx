import ProductForm from "@/components/ProductForm";
import prisma from "@/lib/prisma";
import { Product } from "@/lib/cart-store";

// Mock products database for editing fallbacks
const MOCK_PRODUCTS: Product[] = [
  { id: "m-1", name: "Adubo Orgânico Concentrado Húmus de Minhoca 5kg", description: "Húmus de minhoca 100% orgânico e puro.", shortDesc: "Húmus de minhoca 100% orgânico e puro.", price: 24.90, promoPrice: 19.90, stock: 35, unit: "Saco 5kg", sku: "JAD-001", active: true, featured: true, categoryId: "jardinagem", images: [] },
  { id: "m-2", name: "Vaso Auto-irrigável Gourmet N03 Verde Floresta", description: "Vaso auto-irrigável com sistema de cordões.", shortDesc: "Mantenha suas plantas hidratadas.", price: 32.90, promoPrice: null, stock: 20, unit: "Unidade", sku: "JAD-002", active: true, featured: true, categoryId: "jardinagem", images: [] },
  { id: "m-3", name: "Pá de Mão Estreita Tramontina em Aço", description: "Pá de jardinagem fabricada em aço carbono.", shortDesc: "Ferramenta leve e resistente.", price: 15.50, promoPrice: null, stock: 50, unit: "Unidade", sku: "JAD-003", active: true, featured: false, categoryId: "jardinagem", images: [] },
  { id: "m-4", name: "Ração Premium Especial Cães Adultos Frango 15kg", description: "Nutrição de alta performance.", shortDesc: "Alimento completo com frango.", price: 189.90, promoPrice: 169.90, stock: 15, unit: "Saco 15kg", sku: "PET-001", active: true, featured: true, categoryId: "petshop", images: [] },
  { id: "m-5", name: "Antipulgas e Carrapatos Simparic 20mg", description: "Comprimido mastigável.", shortDesc: "Simparic para cães.", price: 94.50, promoPrice: null, stock: 45, unit: "Caixa 1 Comp.", sku: "PET-002", active: true, featured: true, categoryId: "petshop", images: [] },
  { id: "m-6", name: "Sal Mineral 80 Fosforo para Bovinos 25kg", description: "Suplemento mineral.", shortDesc: "Fósforo para bovinos.", price: 110.00, promoPrice: null, stock: 80, unit: "Saco 25kg", sku: "AGR-001", active: true, featured: true, categoryId: "agropecuaria", images: [] },
];

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let product = null;

  // 1. Try to fetch from DB
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (dbProduct) {
      product = {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        shortDesc: dbProduct.shortDesc || "",
        price: Number(dbProduct.price),
        promoPrice: dbProduct.promoPrice ? Number(dbProduct.promoPrice) : "",
        stock: dbProduct.stock,
        unit: dbProduct.unit,
        sku: dbProduct.sku || "",
        categoryId: dbProduct.categoryId,
        active: dbProduct.active,
        featured: dbProduct.featured,
      };
    }
  } catch (err) {
    console.warn("DB Lookup failed for Product Edit, checking mocks.", err);
  }

  // 2. Check mocks if DB lookup yielded nothing
  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.id === id);
    if (mock) {
      product = {
        id: mock.id,
        name: mock.name,
        description: mock.description,
        shortDesc: mock.shortDesc || "",
        price: mock.price,
        promoPrice: mock.promoPrice || "",
        stock: mock.stock,
        unit: mock.unit,
        sku: mock.sku || "",
        categoryId: mock.categoryId,
        active: mock.active,
        featured: mock.featured,
      };
    }
  }

  if (!product) {
    return (
      <div className="p-6 text-center select-none">
        <span className="text-4xl">🌾</span>
        <h2 className="text-lg font-bold text-gray-800 mt-4">Produto não encontrado</h2>
        <p className="text-xs text-gray-500 mt-2">O produto selecionado não pôde ser localizado ou foi excluído.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-[#1b4332]">Editar Produto</h1>
        <p className="text-xs text-gray-500 mt-1">Ajuste os preços, descrição e nível de estoque do produto.</p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
