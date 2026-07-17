import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import CartDrawer from "@/components/CartDrawer";
import { dbService } from "@/lib/db-service";
import { Product } from "@/lib/cart-store";
import AddToCartSection from "./AddToCartSection";
import { Star, ShieldCheck, Truck, RefreshCw, ChevronRight, ShoppingBag, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ProductReviews from "@/components/ProductReviews";
import StockBadge from "@/components/StockBadge";
import AviseMe from "@/components/AviseMe";
import FavoriteButton from "@/components/FavoriteButton";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import RelatedProducts from "@/components/RelatedProducts";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let product: Product | null = null;
  let categoryName = "Agropecuária";
  let reviews: any[] = [];

  // 1. Fetch using dbService
  const result = await dbService.getProductById(id);
  if (result) {
    product = result;
    categoryName = result.categoryName;
    try {
      reviews = await dbService.getProductReviews(id);
    } catch (err) {
      console.warn("Could not fetch product reviews:", err);
    }
  }

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0; // Default to 5.0 if no reviews yet
  const isTopRated = avgRating >= 4.5 && totalReviews >= 1;

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <CategoryMenu />
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center select-none">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 font-serif">Produto não encontrado</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">O produto que você procura não está disponível ou foi removido.</p>
          <Link href="/" className="mt-6 rounded-md bg-primary text-white px-6 py-2.5 text-sm font-bold hover:bg-primary-dark shadow-xs hover:shadow transition-all">
            Voltar para Início
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasPromo = product.promoPrice !== null && product.promoPrice !== undefined;
  const price = hasPromo ? Number(product.promoPrice) : Number(product.price);
  const originalPrice = Number(product.price);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Categories Bar */}
      <CategoryMenu />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-8 select-none">
          <Link href="/" className="hover:text-primary transition-colors">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/categoria/${product.categoryId}`} className="hover:text-primary transition-colors">{categoryName}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-800 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Info Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Left: Beautiful Product Image Container */}
          <div className="bg-white border border-gray-150 rounded-2xl p-8 flex flex-col items-center justify-center aspect-square shadow-2xs relative select-none">
            {hasPromo && (
              <span className="absolute top-4 left-4 bg-[#e2b13c] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                Promoção
              </span>
            )}
            
            {/* Visual Box */}
            <div className="w-full h-full max-w-[320px] max-h-[320px] border border-gray-100 rounded-2xl overflow-hidden bg-[#fdfdfc] flex flex-col items-center justify-center relative">
              {product.images?.[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-200" />
                  <span className="text-xs text-gray-400 mt-2">Sem imagem</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-450 mt-6 font-bold uppercase tracking-wider">
              Foto Real do Produto
            </p>
          </div>

          {/* Right: Text and Cart Interactions */}
          <div className="space-y-6">
            <div className="space-y-2">
              {/* SKU & Category */}
              <div className="flex items-center gap-3 text-xs font-bold text-primary select-none flex-wrap">
                <span className="bg-primary-light px-2.5 py-1 rounded-md">{categoryName}</span>
                <StockBadge stock={product.stock} />
                {isTopRated && (
                  <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                    ⭐ Mais Avaliado
                  </span>
                )}
                {product.sku && <span className="text-gray-400">SKU: {product.sku}</span>}
              </div>

              {/* Title */}
              <div className="flex justify-between items-start gap-4">
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1b4332] leading-tight flex-1">
                  {product.name}
                </h1>
                <FavoriteButton productId={product.id} size="md" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 select-none">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(avgRating)
                        ? "text-[#e2b13c] fill-[#e2b13c]"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-gray-500 ml-1">
                  {avgRating.toFixed(1)} {totalReviews > 0 ? `(${totalReviews} ${totalReviews === 1 ? 'avaliação' : 'avaliações'})` : "(Excelente)"}
                </span>
              </div>
            </div>

            {/* Price Box & Price History */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <div className="bg-[#fcfcf9] border border-gray-150 rounded-xl p-5 select-none flex-1 flex flex-col justify-center">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-primary">R$ {price.toFixed(2)}</span>
                  {hasPromo && (
                    <span className="text-sm text-gray-400 line-through">R$ {originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">
                  Preço por {product.unit}. Válido para retirada na loja ou entrega em Itu/SP.
                </p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-[220px]">
                <PriceHistoryChart productId={product.id} currentPrice={price} />
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {product.shortDesc || product.description.split(".")[0] + "."}
            </p>

            {/* Interactive AddToCart Area */}
            <AddToCartSection product={product} />

            {/* Avise-me if out of stock */}
            {product.stock === 0 && (
              <div className="mt-4">
                <AviseMe productId={product.id} />
              </div>
            )}

            {/* Features list */}
            <div className="pt-6 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800">Origem Garantida</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Insumos originais</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800">Entrega Itu/SP</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Rápida e segura</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-gray-800">Troca na Loja</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Atendimento presencial</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed description */}
        <div className="mt-16 pt-10 border-t border-gray-150 space-y-4">
          <h3 className="font-serif text-xl font-extrabold text-[#1b4332]">Descrição Completa do Produto</h3>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 text-sm text-gray-600 leading-relaxed space-y-4 font-medium">
            <p>{product.description}</p>
            <p>
              Na <strong>Agromil</strong>, nos preocupamos em oferecer produtos de primeira qualidade para garantir a satisfação dos nossos clientes de Itu/SP e região. Se tiver alguma dúvida sobre a aplicação ou adequação deste item para o seu cultivo ou pet, sinta-se à vontade para nos acionar diretamente pelo WhatsApp.
            </p>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-10">
          <RelatedProducts categoryId={product.categoryId} excludeProductId={product.id} />
        </div>

        {/* Product Reviews */}
        <div className="mt-10">
          <ProductReviews productId={product.id} />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
