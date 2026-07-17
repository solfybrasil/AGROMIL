"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import CartDrawer from "@/components/CartDrawer";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && messageText) {
      setSent(true);
      setName("");
      setEmail("");
      setMessageText("");
      setTimeout(() => setSent(false), 5000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Category horizontal menu */}
      <CategoryMenu />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center space-y-3 mb-12 select-none">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Contato e Localização</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1b4332]">Fale com a Agromil</h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">Visite nossa loja física em Itu/SP ou nos envie uma mensagem rápida.</p>
        </div>

        {/* 2 Columns: Info & Map VS Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* Left Column: Info & Map */}
          <div className="space-y-6">
            
            {/* Info Cards */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-6 select-none">
              
              {/* Address */}
              <div className="flex gap-3">
                <div className="rounded-full bg-primary-light p-2 text-primary flex-shrink-0 self-start">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs space-y-0.5 text-gray-600">
                  <h4 className="font-bold text-gray-800">Endereço</h4>
                  <p>Av. Caetano Ruggieri, 2191</p>
                  <p>Parque Res. Mayard</p>
                  <p>Itu - SP, 13310-160</p>
                </div>
              </div>

              {/* Phones */}
              <div className="flex gap-3">
                <div className="rounded-full bg-primary-light p-2 text-primary flex-shrink-0 self-start">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs space-y-0.5 text-gray-600">
                  <h4 className="font-bold text-gray-800">Atendimento Telefônico</h4>
                  <p>WhatsApp/Loja: (11) 4023-3503</p>
                  <p>Comprar: whatsapp.com</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3">
                <div className="rounded-full bg-primary-light p-2 text-primary flex-shrink-0 self-start">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs space-y-0.5 text-gray-600">
                  <h4 className="font-bold text-gray-800">E-mail</h4>
                  <p>contato@agromilitu.com.br</p>
                  <p>vendas@agromilitu.com.br</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-3">
                <div className="rounded-full bg-primary-light p-2 text-primary flex-shrink-0 self-start">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs space-y-0.5 text-gray-600">
                  <h4 className="font-bold text-gray-800">Horário de Funcionamento</h4>
                  <p>Segunda a Sexta: 07:30 às 18:00</p>
                  <p>Sábados: 07:30 às 13:00</p>
                  <p className="text-red-500 font-semibold mt-1">Domingos: Fechado</p>
                </div>
              </div>

            </div>

            {/* Mock Map Container */}
            <div className="bg-[#1b4332] text-white border border-[#2d6a4f]/20 rounded-2xl p-6 aspect-video flex flex-col justify-between shadow-2xs relative overflow-hidden select-none">
              <div className="absolute inset-0 bg-radial from-transparent to-[#1a2f23]" />
              <div className="z-10 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full inline-block self-start text-[10px] font-bold tracking-widest uppercase">
                Itu / SP
              </div>
              <div className="z-10 space-y-2">
                <h4 className="font-serif text-lg font-bold text-[#e2b13c]">Como chegar na nossa sede</h4>
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  Estamos localizados na Avenida Caetano Ruggieri, nº 2191, Parque Residencial Mayard, Itu/SP. Estacionamento amplo e gratuito na frente da agropecuária.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5 select-none">
              <Send className="h-4.5 w-4.5 text-primary" />
              Envie uma Mensagem
            </h3>

            {sent && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-bounce select-none">
                <CheckCircle className="h-4.5 w-4.5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Mensagem enviada com sucesso! Retornaremos o contato em breve.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="user-name" className="block text-xs font-bold text-gray-700 mb-1.5 select-none">
                  Seu Nome *
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="user-email" className="block text-xs font-bold text-gray-700 mb-1.5 select-none">
                  Seu E-mail *
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="user-msg" className="block text-xs font-bold text-gray-700 mb-1.5 select-none">
                  Mensagem *
                </label>
                <textarea
                  id="user-msg"
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escreva sua dúvida, sugestão ou solicitação de orçamento..."
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-sm hover:shadow transition-all active:scale-95 select-none"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Enviar Mensagem</span>
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Slider */}
      <CartDrawer />
    </div>
  );
}
