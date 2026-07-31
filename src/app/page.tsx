"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowRight, Smartphone, ShoppingBag, Layers, Sparkles } from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import HeroSlider from "@/components/HeroSlider";
import CategoryProductScrollRows from "@/components/CategoryProductScrollRows";
import BannerCarousel from "@/components/BannerCarousel";
import { getCurrentUserId, getRecommendations, hasPersonalization } from "@/lib/recommendation-engine";
import { dbService } from "@/lib/db-service";

export default function Home() {
  const [userId, setUserId] = useState<string>("guest");
  const [recommended, setRecommended] = useState<any[]>([]);
  const [hasPersonal, setHasPersonal] = useState(false);

  useEffect(() => {
    const uid = getCurrentUserId();
    setUserId(uid);
    setHasPersonal(hasPersonalization(uid));
    dbService.getProducts().then((products) => {
      if (products && products.length > 0) {
        const recs = getRecommendations(uid, products as any[], 12);
        setRecommended(recs);
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5EFE6] text-[#2B2620]">
      {/* 1. Header Fixo */}
      <Header />

      {/* 2. Hero da Home (Luxora Full-Bleed Editorial) */}
      <HeroSlider />

      {/* 3. Categorias & Produtos */}
      <CategoryProductScrollRows />

      {/* 4. Seção PARA VOCÊ — Feed personalizado por conta */}
      {recommended.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 py-12">
          <div className="flex items-center justify-between gap-3 mb-6 border-b border-[#EDE3D3] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-widest block mb-0.5">
                {hasPersonal ? "Feed Personalizado" : "Em Destaque"}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B2620] flex items-center gap-2">
                {hasPersonal ? (
                  <><Sparkles className="h-5 w-5 text-[#8B5E3C]" /> Escolhidos Para Você</>
                ) : (
                  "Destaques da Semana"
                )}
              </h2>
              {hasPersonal && (
                <p className="text-[11px] text-[#7A6F63] mt-1">
                  Baseado nas suas preferências e histórico de navegação
                </p>
              )}
            </div>
            <Link href="/busca" className="text-[11px] font-bold text-[#8B5E3C] hover:text-[#2B2620] transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}


      {/* 4. Seção Editorial (Fashion Store Design & Whitespace) */}
      <section className="bg-[#EDE3D3] py-14 sm:py-16 px-3 sm:px-5 lg:px-6 border-y border-[#EDE3D3]/60">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Editorial Block */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest">
              Fashion Store Design — Atelier Siluet
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#2B2620] leading-tight">
              Design Atemporal & <br />
              <span className="italic text-[#8B5E3C] font-normal">Estética Minimalista</span>
            </h2>
            
            <p className="text-sm md:text-base text-[#7A6F63] leading-relaxed font-normal">
              Na <strong>SILUET</strong>, acreditamos que a moda de luxo reside no equilíbrio perfeito entre linhas puras, tecidos nobres e silhuetas que abraçam a beleza feminina sem excessos. Cada peça é desenhada para transcender tendências passageiras.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#8B5E3C]/20">
              <div>
                <h4 className="font-serif text-xl font-semibold text-[#2B2620]">Linho & Seda 100%</h4>
                <p className="text-xs text-[#7A6F63] mt-1">Matérias-primas de origem sustentável e toque ultra aveludado.</p>
              </div>
              <div>
                <h4 className="font-serif text-xl font-semibold text-[#2B2620]">Corte Alfaiataria</h4>
                <p className="text-xs text-[#7A6F63] mt-1">Modelagem ergonômica desenvolvida para caimento impecável.</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/sobre"
                className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#8B5E3C] text-white px-8 py-4 text-xs font-medium uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Conhecer o Atelier</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Visual Editorial Image Layout */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-white/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
                alt="Editorial Look Siluet"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-white/40 translate-y-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=800&auto=format&fit=crop"
                alt="Editorial Details Siluet"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 5. Seção Mobile Preview & App Mockup */}
      <section className="py-14 sm:py-16 px-3 sm:px-5 lg:px-6 max-w-[1440px] mx-auto w-full">
        <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-14 text-white grid grid-cols-1 lg:grid-cols-12 gap-10 items-center overflow-hidden shadow-2xl relative">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#EDE3D3] text-xs font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/10">
              <Smartphone className="h-3.5 w-3.5 text-[#8B5E3C]" />
              <span>Experiência Mobile First</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight">
              Sua Loja Favorita <br />
              <span className="italic font-normal text-[#EDE3D3]">Na Palma da Mão</span>
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal max-w-md">
              Navegação ultra rápida, carrinho instantâneo sem recarregar a página, seletor visual de cores e checkout simplificado no Pix ou WhatsApp em segundos.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-[#8B5E3C]" />
                <div>
                  <h4 className="text-xs font-bold text-white">Carrinho Drawer</h4>
                  <p className="text-[10px] text-gray-400">Adicione sem sair da página</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl">
                <Layers className="h-5 w-5 text-[#8B5E3C]" />
                <div>
                  <h4 className="text-xs font-bold text-white">Filtros Dinâmicos</h4>
                  <p className="text-[10px] text-gray-400">Cor, tamanho e categoria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Mockup Representation */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[280px] bg-[#F5EFE6] text-[#2B2620] rounded-[40px] p-4 shadow-2xl border-4 border-gray-800 relative">
              <div className="w-24 h-4 bg-gray-800 rounded-full mx-auto mb-3" />
              <div className="space-y-3">
                <div className="h-8 bg-[#EDE3D3] rounded-lg flex items-center px-3 justify-between">
                  <span className="font-serif text-xs font-bold">SILUET</span>
                  <ShoppingBag className="h-4 w-4 text-[#8B5E3C]" />
                </div>
                <div className="h-28 rounded-lg overflow-hidden bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="App preview" />
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#EDE3D3] space-y-1">
                  <div className="h-3 bg-[#EDE3D3] rounded w-3/4" />
                  <div className="h-3 bg-[#8B5E3C]/20 rounded w-1/2" />
                  <div className="mt-2 h-7 bg-[#1A1A1A] rounded text-white text-[9px] font-bold flex items-center justify-center">
                    Comprar em 1-Clique
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Newsletter Incentive Section */}
      <section className="bg-[#F5EFE6] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#EDE3D3]">
        <div className="max-w-3xl mx-auto text-center space-y-6 select-none">
          <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest">Atelier Newsletter</span>
          <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2B2620]">
            Receba Acesso Antecipado às Novas Coleções
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6F63] max-w-md mx-auto leading-relaxed font-normal">
            Assine nossa newsletter VIP e receba 10% OFF na primeira compra, cupons exclusivos e dicas editoriais de styling.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="email"
              placeholder="Digite seu e-mail de preferência"
              className="flex-1 bg-white border border-[#EDE3D3] rounded-none py-3.5 px-4 text-xs text-[#2B2620] placeholder-[#7A6F63] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-[#1A1A1A] hover:bg-[#8B5E3C] text-white rounded-none py-3.5 px-8 text-xs font-medium uppercase tracking-wider transition-colors active:scale-95 whitespace-nowrap shadow-sm"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Shopping Cart Drawer */}
      <CartDrawer />

      {/* Product Details Modal */}
      <ProductDetailsModal />
    </div>
  );
}
