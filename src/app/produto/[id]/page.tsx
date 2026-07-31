"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const pathId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "";
  const id = rawId || (pathId !== "produto" ? pathId : "");

  const [product, setProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("Agropecuária");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    async function loadProduct() {
      try {
        let result: any = await dbService.getProductById(id);
        
        if (!result) {
          try {
            const res = await fetch(`/api/produtos/${id}`);
            if (res.ok) {
              result = await res.json();
            }
          } catch (e) {
            console.warn("Fallback /api/produtos/[id] failed:", e);
          }
        }

        if (!result) {
          try {
            const allProducts = await dbService.getProducts({ includeInactive: true });
            result = allProducts.find((p: any) => String(p.id) === String(id));
          } catch (e) {
            console.warn("Fallback dbService.getProducts failed:", e);
          }
        }

        if (active && result) {
          setProduct(result);
          setCategoryName(result.categoryName || "Agropecuária");
          try {
            const revs = await dbService.getProductReviews(id);
            if (active) setReviews(revs);
          } catch (err) {
            console.warn("Could not fetch product reviews:", err);
          }
        }
      } catch (err) {
        console.error("Error loading product detail page:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0;
  const isTopRated = avgRating >= 4.5 && totalReviews >= 1;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <CategoryMenu />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider animate-pulse">
            Carregando página do produto...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

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
  const discountPercentage = hasPromo
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5EFE6] text-[#2B2620] font-sans">
      {/* 1. Header */}
      <Header />

      {/* 2. Categorias Bar (Carrega Dinamicamente) */}
      <CategoryMenu />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold text-[#7A6F63] uppercase tracking-wider mb-8 select-none overflow-x-auto scrollbar-none">
          <Link href="/" className="hover:text-[#8B5E3C] transition-colors whitespace-nowrap">Início</Link>
          <ChevronRight className="h-3 w-3 text-[#8B5E3C]/60 flex-shrink-0" />
          <Link href={`/categoria/${product.categoryId}`} className="hover:text-[#8B5E3C] transition-colors whitespace-nowrap">
            {categoryName}
          </Link>
          <ChevronRight className="h-3 w-3 text-[#8B5E3C]/60 flex-shrink-0" />
          <span className="text-[#2B2620] truncate max-w-[220px] font-semibold">{product.name}</span>
        </nav>

        {/* Product Main Section: Minimalist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left: Product Image Gallery (Minimalist Chic Box) */}
          <div className="lg:col-span-7 space-y-4 select-none">
            <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center aspect-square shadow-sm relative overflow-hidden group">
              {hasPromo && (
                <span className="absolute top-5 left-5 bg-[#8B5E3C] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full z-10 shadow-xs">
                  -{discountPercentage}% OFF
                </span>
              )}
              
              <div className="absolute top-5 right-5 z-10 bg-white/90 backdrop-blur-xs rounded-full p-1 shadow-3xs border border-[#EDE3D3]">
                <FavoriteButton productId={product.id} size="md" />
              </div>

              {/* Main Active Image Display */}
              <div className="w-full h-full max-w-[420px] max-h-[420px] flex items-center justify-center relative">
                {product.images && product.images.length > 0 && product.images[selectedImageIndex] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-[#7A6F63]">
                    <ShoppingBag className="h-16 w-16 text-[#EDE3D3] mb-2" />
                    <span className="text-xs uppercase font-bold tracking-widest text-gray-400">Sem Foto</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Selector (If multiple images exist) */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none justify-start">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 overflow-hidden bg-white p-1 transition-all cursor-pointer flex-shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-[#8B5E3C] shadow-md scale-105"
                        : "border-[#EDE3D3] opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Clean Editorial Product Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              {/* Category & SKU */}
              <div className="flex items-center gap-3 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest select-none flex-wrap">
                <span className="bg-[#EDE3D3]/60 px-3 py-1 rounded-full border border-[#EDE3D3]">{categoryName}</span>
                <StockBadge stock={product.stock} />
                {isTopRated && (
                  <span className="bg-amber-100/80 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold">
                    ★ Destaque Avaliado
                  </span>
                )}
                {product.sku && <span className="text-[#7A6F63]">REF: {product.sku}</span>}
              </div>

              {/* Title */}
              <div>
                <span className="font-script text-3xl text-[#8B5E3C] block capitalize font-normal leading-none mb-1">
                  Coleção Exclusiva
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2620] leading-tight tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 select-none pt-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgRating)
                          ? "text-[#C86D51] fill-[#C86D51]"
                          : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#5C5346] ml-1">
                  {avgRating.toFixed(1)} <span className="text-[#7A6F63] font-normal">({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})</span>
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-white border border-[#EDE3D3] rounded-2xl p-6 shadow-3xs space-y-2 select-none">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#2B2620] tracking-tight">
                  R$ {price.toFixed(2).replace(".", ",")}
                </span>
                {hasPromo && (
                  <span className="text-base text-[#7A6F63] line-through font-normal">
                    R$ {originalPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6F63] font-medium leading-relaxed">
                em até <strong className="text-[#2B2620]">6x de R$ {(price / 6).toFixed(2).replace(".", ",")}</strong> sem juros no cartão ou com <strong className="text-[#8B5E3C]">5% OFF no PIX</strong>
              </p>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-[#5C5346] leading-relaxed font-normal">
              {product.shortDesc || product.description.split(".")[0] + "."}
            </p>

            {/* Interactive AddToCart Section */}
            <AddToCartSection product={product} />

            {/* Avise-me if out of stock */}
            {product.stock === 0 && (
              <div className="mt-4">
                <AviseMe productId={product.id} />
              </div>
            )}

            {/* Features Minimalist List */}
            <div className="pt-6 border-t border-[#EDE3D3] grid grid-cols-3 gap-3 text-center select-none">
              <div className="p-3 bg-white/60 border border-[#EDE3D3] rounded-2xl flex flex-col items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-[#8B5E3C]" />
                <h4 className="text-[10px] font-black uppercase text-[#2B2620] tracking-wider">Origem Garantida</h4>
              </div>

              <div className="p-3 bg-white/60 border border-[#EDE3D3] rounded-2xl flex flex-col items-center gap-1.5">
                <Truck className="h-5 w-5 text-[#8B5E3C]" />
                <h4 className="text-[10px] font-black uppercase text-[#2B2620] tracking-wider">Envio Rápido</h4>
              </div>

              <div className="p-3 bg-white/60 border border-[#EDE3D3] rounded-2xl flex flex-col items-center gap-1.5">
                <RefreshCw className="h-5 w-5 text-[#8B5E3C]" />
                <h4 className="text-[10px] font-black uppercase text-[#2B2620] tracking-wider">Troca 30 Dias</h4>
              </div>
            </div>

          </div>
        </div>

        {/* Editorial Detailed Description */}
        <div className="mt-16 pt-12 border-t border-[#EDE3D3] space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#8B5E3C]" />
            <h3 className="font-serif text-2xl font-semibold text-[#2B2620]">Detalhes & Ficha Técnica</h3>
          </div>
          
          <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 md:p-10 text-xs sm:text-sm text-[#5C5346] leading-relaxed space-y-4 font-normal shadow-3xs">
            <p className="whitespace-pre-line">{product.description}</p>
            <div className="pt-4 border-t border-[#FAF7F2] text-xs text-[#7A6F63]">
              <p>
                Todos os nossos itens são selecionados com padrão rigoroso de qualidade. Caso precise de auxílio na escolha ou atendimento sob medida, nossa equipe está sempre à disposição.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 pt-8 border-t border-[#EDE3D3]">
          <RelatedProducts categoryId={product.categoryId} excludeProductId={product.id} />
        </div>

        {/* Product Reviews */}
        <div className="mt-12">
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
