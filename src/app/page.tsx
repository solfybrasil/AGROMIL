import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import HeroSlider from "@/components/HeroSlider";
import IFoodCategories from "@/components/IFoodCategories";
import { dbService } from "@/lib/db-service";
import { Product } from "@/lib/cart-store";
import { Leaf, Shield, Award, Sprout, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import BannerCarousel from "@/components/BannerCarousel";

// Buscar dados a cada request para refletir edições/adições de produtos
// (destaques, etc.) instantaneamente, sem aguardar revalidação de cache.
export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = (await dbService.getProducts({ featured: true })).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Banner Slider Carousel */}
      <HeroSlider />

      {/* iFood-style categories bubbles row */}
      <IFoodCategories />

      {/* Promotional Banners Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <BannerCarousel />
      </div>

      {/* Benefits Highlights Section */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3 p-3">
            <div className="rounded-full bg-primary-light p-2.5 text-primary flex-shrink-0">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Produtos Selecionados</h4>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Melhores sementes e insumos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="rounded-full bg-[#fdf2e9] p-2.5 text-[#e2b13c] flex-shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Compra 100% Segura</h4>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Checkout direto no WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="rounded-full bg-primary-light p-2.5 text-primary flex-shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Tradição em Itu/SP</h4>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Parceria forte desde 2012</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="rounded-full bg-[#fdf2e9] p-2.5 text-[#e2b13c] flex-shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Técnicos Especialistas</h4>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Dicas e orientações de manejo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Nossas Indicações</span>
          <h2 className="font-serif text-3xl font-extrabold text-[#1b4332]">Destaques da Semana</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">Confira os produtos mais procurados pelos sítios e residências de Itu nos últimos dias.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* "Our Story" Section with Stock Photography */}
      <section className="bg-[#fcfcf9] py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Story Visual Box - Stock Photography */}
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg select-none group border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/agromil-loja.jpg"
              alt="Fachada da Agromil Agropecuária em Itu/SP"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b4332]/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
              <div className="rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-[9px] font-bold tracking-widest uppercase self-start mb-4 border border-white/5">
                Sede Itu/SP
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#e2b13c]">Agromil Agropecuária</h3>
              <p className="text-[11px] text-gray-200 mt-1 leading-none font-medium">Av. Caetano Ruggieri, 2191 - Parque Res. Mayard</p>
            </div>
          </div>

          {/* Story Text */}
          <div className="space-y-6">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Nossa História</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1b4332] leading-tight">
              Tradição e Parceria com o Lar e o Produtor Rural
            </h2>
            
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Fundada em Itu/SP, a <strong>Agromil</strong> nasceu com a missão de aproximar os melhores recursos de cultivo e cuidado animal de quem ama a vida no campo e na cidade. Oferecemos um atendimento consultivo de verdade: ajudamos você a escolher a ração ideal para o seu pet, o adubo correto para sua horta e a ferramenta certa para sua poda.
            </p>

            {/* Bullets with icons */}
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <div className="rounded-full bg-primary-light p-1 text-primary flex-shrink-0 h-6 w-6 flex items-center justify-center">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Origem e Qualidade Garantidas</h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Trabalhamos apenas com marcas líderes homologadas pelo Ministério da Agricultura.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="rounded-full bg-primary-light p-1 text-primary flex-shrink-0 h-6 w-6 flex items-center justify-center">
                  <Heart className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Atendimento Ituano Amigável</h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Nossa equipe é formada por especialistas prontos para ajudar no balcão ou WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/sobre"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-dark text-white px-6 py-3 text-sm font-bold transition-all shadow-xs"
              >
                <span>Conhecer Nossa História</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Incentive Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto rounded-3xl bg-[#1b4332] p-8 md:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 text-white/5 pointer-events-none translate-x-12 -translate-y-12">
            <Leaf className="h-48 w-48 fill-current" />
          </div>
          
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">
            Receba Dicas de Cultivo e Ofertas Especiais!
          </h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed font-medium">
            Assine nossa newsletter semanal e receba cupons de desconto, novidades sobre rações e dicas exclusivas de jardinagem preparadas pelos nossos agrônomos.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="email"
              placeholder="Digite seu melhor e-mail"
              className="flex-1 bg-white/10 border border-white/20 rounded-md py-3 px-4 text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white focus:text-[#1b4332] focus:placeholder-gray-400 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-[#e2b13c] hover:bg-[#cfa132] text-[#1b4332] rounded-md py-3 px-6 text-sm font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Shopping Cart Slider Drawer */}
      <CartDrawer />

      {/* Product Details Modal (iFood Style) */}
      <ProductDetailsModal />
    </div>
  );
}
