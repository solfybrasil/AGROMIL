import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import { dbService } from "@/lib/db-service";
import { Product } from "@/lib/cart-store";
import { Flower2, Dog, Wheat, Sprout, Pipette, ShieldAlert, SlidersHorizontal, Search } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const searchQuery = resolvedSearchParams.q || "";

  // 1. Identify category attributes
  let categoryName = "";
  let categoryIcon = Flower2;
  let catId = `cat-${slug}`;

  switch (slug) {
    case "jardinagem":
      categoryName = "Jardinagem & Vasos";
      categoryIcon = Flower2;
      break;
    case "petshop":
      categoryName = "Rações & Acessórios Pet";
      categoryIcon = Dog;
      break;
    case "agropecuaria":
      categoryName = "Agropecuária Geral";
      categoryIcon = Wheat;
      break;
    case "ferramentas":
      categoryName = "Ferramentas & Equipamentos";
      categoryIcon = Sprout;
      break;
    case "irrigacao":
      categoryName = "Irrigação";
      categoryIcon = Pipette;
      break;
    case "vestuario-epi":
      categoryName = "Vestuário & EPI";
      categoryIcon = ShieldAlert;
      break;
    case "busca":
      categoryName = `Resultados para: "${searchQuery}"`;
      categoryIcon = SlidersHorizontal;
      break;
    default:
      categoryName = "Produtos";
      categoryIcon = SlidersHorizontal;
  }

  // 2. Fetch category and products using dbService
  let products: Product[] = [];
  let categoryExists = false;

  if (slug === "busca") {
    products = await dbService.getProducts({ search: searchQuery });
  } else {
    const categories = await dbService.getCategories();
    const currentCat = categories.find((c) => c.slug === slug);
    if (currentCat) {
      categoryExists = true;
      products = await dbService.getProducts({ categoryId: currentCat.id });
    }
  }

  const HeadingIcon = categoryIcon;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Category Horizontal Navigation */}
      <CategoryMenu />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Banner Title */}
        <div className="rounded-2xl bg-primary-light/50 border border-primary/10 p-6 sm:p-10 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary p-3 text-white">
              <HeadingIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1b4332]">
                {categoryName}
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-primary bg-white border border-gray-200 px-3.5 py-1.5 rounded-full">
            Agromil Itu/SP
          </span>
        </div>

        {/* Sidebar + Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filter Category Block */}
            <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-2xs select-none">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filtros
              </h3>
              
              <div className="space-y-4">
                {/* Price range */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 mb-2">Faixa de Preço</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 font-semibold">
                      <span>R$ 0,00</span>
                      <span>R$ 500,00+</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full relative">
                      <div className="absolute left-0 right-0 top-0 bottom-0 bg-primary/20 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 mb-2">Disponibilidade</h4>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer font-semibold">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span>Em estoque</span>
                  </label>
                </div>

                {/* Offers */}
                <div>
                  <h4 className="text-xs font-bold text-[#1b4332] mb-2 font-serif">Promoções</h4>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer font-semibold">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span>Itens com Desconto</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Helper Widget */}
            <div className="rounded-xl bg-[#1b4332] p-5 text-white shadow-sm select-none">
              <h4 className="font-serif text-base font-bold text-[#e2b13c]">Precisa de ajuda?</h4>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed font-medium">
                Fale direto com o nosso agrônomo ou balconista e tire suas dúvidas sobre dosagem de adubos ou ração ideal.
              </p>
              <a
                href="https://wa.me/551140233503"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center bg-white text-primary-dark font-extrabold text-xs py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                Chamar no WhatsApp
              </a>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-150 rounded-2xl p-6">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-gray-800">Nenhum produto encontrado</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto font-medium">
                  Não encontramos produtos nessa categoria ou com o termo pesquisado. Tente buscar por termos genéricos como "adubo" ou "ração".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Product Details Modal (iFood Style) */}
      <ProductDetailsModal />
    </div>
  );
}
