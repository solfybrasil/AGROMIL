import ProductForm from "@/components/ProductForm";
import { dbService } from "@/lib/db-service";
import { Product } from "@/lib/cart-store";
import { MOCK_PRODUCTS } from "@/lib/mocks";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let product = null;

  // 1. Try to fetch from DB
  try {
    const dbProduct = await dbService.getProductById(id);

    if (dbProduct) {
      product = {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        shortDesc: dbProduct.shortDesc || "",
        price: dbProduct.price,
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
