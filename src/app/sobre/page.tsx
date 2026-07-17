import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import CartDrawer from "@/components/CartDrawer";
import { ShieldCheck, UserCheck, Sprout, Heart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const values = [
    { title: "Qualidade Garantida", desc: "Trabalhamos apenas com defensivos, rações e insumos homologados e de alta performance.", icon: ShieldCheck },
    { title: "Atendimento Consultivo", desc: "Nossos balconistas e técnicos ajudam você a escolher o melhor produto para sua necessidade.", icon: UserCheck },
    { title: "Tradição no Campo", desc: "Nascidos em Itu, conhecemos o clima, solo e as demandas dos produtores da nossa região.", icon: Sprout },
    { title: "Respeito Animal", desc: "Apoiamos o bem-estar animal com rações balanceadas e medicamentos veterinários de ponta.", icon: Heart },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Category Horizontal Navigation */}
      <CategoryMenu />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Title */}
        <div className="text-center space-y-3 select-none">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Institucional</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1b4332]">Sobre a Agromil</h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">Parceria de gerações com o produtor rural e o morador de Itu/SP.</p>
        </div>

        {/* Story */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-6 text-sm text-gray-600 leading-relaxed">
          <p>
            A <strong>Agromil Agropecuária</strong> foi fundada com um propósito simples, mas forte: ser a parceira de confiança do produtor rural, do jardineiro doméstico e de quem ama e cuida de animais em Itu/SP e região. Começamos pequenos, no balcão atendendo amigos e vizinhos, e hoje nos orgulhamos de oferecer um portfólio completo que une o melhor em nutrição para pet e gado, insumos para cultivo e ferramentas profissionais.
          </p>
          <p>
            Nossa sede, localizada estrategicamente no bairro <strong>Parque Res. Mayard em Itu</strong>, conta com uma equipe especializada. Acreditamos que vender um produto agropecuário não é apenas entregar um pacote; é entender a dosagem de adubo correta, a ração que trará mais energia para o rebanho ou o antipulgas ideal para o pet.
          </p>
          <p>
            Ao longo dos anos, expandimos nossas operações com este marketplace para facilitar as compras do dia a dia. Pelo celular ou computador, você monta seu carrinho e fecha o pedido direto no nosso WhatsApp, recebendo a mercadoria com comodidade no seu sítio, chácara ou residência urbana.
          </p>
        </div>

        {/* Values Section */}
        <div className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#1b4332] text-center select-none">Nossos Valores</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-5 shadow-3xs flex gap-4 select-none">
                  <div className="rounded-full bg-primary-light p-2.5 text-primary flex-shrink-0 self-start">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{v.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div className="rounded-2xl bg-[#1b4332] p-8 text-white text-center space-y-4 shadow-sm select-none">
          <h3 className="font-serif text-xl font-bold text-[#e2b13c]">Como podemos te ajudar hoje?</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Dúvidas sobre produtos ou orçamentos especiais de atacado? Entre em contato agora pelo nosso telefone ou WhatsApp.
          </p>
          <div className="pt-2">
            <Link
              href="/contato"
              className="rounded-full bg-white text-primary-dark font-bold text-xs px-6 py-2.5 hover:bg-gray-50 transition-colors inline-block"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
