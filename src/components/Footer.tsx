"use client";

import { Phone, Mail, Instagram, Facebook, ShieldCheck, Truck, RefreshCw, Sparkles, Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#F5EFE6] mt-auto border-t border-[#EDE3D3]">

      {/* ── Mobile Footer: minimal ── */}
      <div className="sm:hidden px-4 py-5">
        {/* Logo + brand */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
          </Link>
          <div className="flex gap-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="bg-white/10 p-2 rounded-full text-gray-300 hover:bg-[#8B5E3C] transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="bg-white/10 p-2 rounded-full text-gray-300 hover:bg-[#8B5E3C] transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Quick links — 2 cols */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs text-gray-400">
          <Link href="/categoria/vestidos" className="hover:text-white transition-colors py-0.5">Vestidos</Link>
          <Link href="/categoria/conjuntos" className="hover:text-white transition-colors py-0.5">Conjuntos</Link>
          <Link href="/categoria/tops-blusas" className="hover:text-white transition-colors py-0.5">Tops &amp; Blusas</Link>
          <Link href="/categoria/acessorios" className="hover:text-white transition-colors py-0.5">Acessórios</Link>
          <Link href="/pedidos" className="hover:text-white transition-colors py-0.5">Rastrear Pedido</Link>
          <Link href="/contato" className="hover:text-white transition-colors py-0.5">Fale Conosco</Link>
        </div>

        {/* Perks chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { icon: Truck, label: "Frete Grátis" },
            { icon: RefreshCw, label: "Troca 30 dias" },
            { icon: ShieldCheck, label: "Pix 5% OFF" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[10px] text-gray-300">
              <Icon className="h-3 w-3 text-[#8B5E3C]" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-3 flex flex-col gap-1">
          <p className="text-[10px] text-gray-500">&copy; {currentYear} Agromil. Todos os direitos reservados.</p>
          <p className="text-[10px] text-gray-600">PIX 5% OFF · Cartão em até 12x · Boleto</p>
        </div>
      </div>

      {/* ── Desktop Footer: full ── */}
      <div className="hidden sm:block pt-16 pb-8">
        {/* Perks Banner */}
        <div className="max-w-[1440px] mx-auto px-5 lg:px-6 pb-12 border-b border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, title: "Frete Rápido", desc: "Envio expresso para todo o Brasil" },
            { icon: RefreshCw, title: "Troca Grátis", desc: "Até 30 dias sem complicações" },
            { icon: ShieldCheck, title: "Pagamento Seguro", desc: "Pix 5% OFF ou até 12x no cartão" },
            { icon: Sparkles, title: "Qualidade Premium", desc: "Tecidos nobres e caimento perfeito" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center space-y-2 p-4 bg-white/5 border border-white/10">
              <Icon className="h-6 w-6 text-[#8B5E3C]" />
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white">{title}</h4>
              <p className="text-[11px] text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="max-w-[1440px] mx-auto px-5 lg:px-6 pt-12 grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand & Newsletter */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Moda feminina autoral com estética minimalista, cortes refinados em linho e seda, e caimento perfeito.
            </p>
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#8B5E3C] mb-2">
                Ganhe 15% OFF na primeira compra
              </h4>
              {subscribed ? (
                <p className="text-xs font-medium text-emerald-400 bg-emerald-950/50 p-2.5 border border-emerald-500/30">
                  ✨ Cupom enviado! Use SILUET15.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                  <input
                    type="email" required placeholder="Seu melhor e-mail..."
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border border-white/20 px-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#8B5E3C] flex-1"
                  />
                  <button type="submit"
                    className="bg-[#8B5E3C] hover:bg-[#2B2620] text-white p-2.5 transition-colors flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8B5E3C] mb-4">Coleções</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {["Vestidos & Midis|/categoria/vestidos", "Tops & Croppeds|/categoria/tops-blusas", "Conjuntos Alfaiataria|/categoria/conjuntos", "Calças Wide Leg|/categoria/calcas-jeans", "Bolsas & Acessórios|/categoria/acessorios"].map((item) => {
                const [label, href] = item.split("|");
                return (
                  <li key={href}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8B5E3C] mb-4">Institucional</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {["Rastrear Pedido|/pedidos", "Sobre a Marca|/sobre", "Política de Troca|/contato", "Fale Conosco|/contato"].map((item) => {
                const [label, href] = item.split("|");
                return (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8B5E3C] mb-4">Redes & Contato</h3>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="bg-white/10 p-2.5 hover:bg-[#8B5E3C] transition-colors text-gray-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="bg-white/10 p-2.5 hover:bg-[#8B5E3C] transition-colors text-gray-300">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#8B5E3C]" />(11) 98888-7777</p>
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#8B5E3C]" />atendimento@agromil.com.br</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-[1440px] mx-auto px-5 lg:px-6 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {currentYear} Agromil Marketplace. Todos os direitos reservados.</p>
          <div className="flex gap-3 text-xs font-semibold text-gray-400">
            <span>PIX 5% OFF</span><span>•</span><span>Cartão em até 12x</span><span>•</span><span>Boleto Bancário</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
