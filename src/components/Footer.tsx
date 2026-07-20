"use client";

import { Leaf, Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1b4332] text-white pt-16 pb-8 mt-auto border-t-4 border-[#e2b13c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center bg-white/95 rounded-xl p-3 max-w-[200px] shadow-2xs select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Agromil Logo"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Sua agropecuária de confiança em Itu/SP. Oferecemos o melhor em jardinagem, pet shop, nutrição animal, ferramentas e acessórios rurais. Tradição e qualidade que cultivamos com você.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="https://www.facebook.com/agromil.agropecuaria/?locale=pt_BR"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#2d6a4f] p-2 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/agromilagropecuaria"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#2d6a4f] p-2 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#e2b13c] mb-5">
            Links Rápidos
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-300">
            <li>
              <Link href="/" className="hover:text-[#e2b13c] transition-colors">
                Início
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-[#e2b13c] transition-colors">
                Sobre a Agromil
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-[#e2b13c] transition-colors">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories Column */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#e2b13c] mb-5">
            Categorias
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-300">
            <li>
              <Link href="/categoria/jardinagem" className="hover:text-[#e2b13c] transition-colors">
                Jardinagem & Vasos
              </Link>
            </li>
            <li>
              <Link href="/categoria/petshop" className="hover:text-[#e2b13c] transition-colors">
                Rações & Acessórios Pet
              </Link>
            </li>
            <li>
              <Link href="/categoria/agropecuaria" className="hover:text-[#e2b13c] transition-colors">
                Suplementos & Defensivos
              </Link>
            </li>
            <li>
              <Link href="/categoria/ferramentas" className="hover:text-[#e2b13c] transition-colors">
                Ferramentas & Equipamentos
              </Link>
            </li>
            <li>
              <Link href="/categoria/irrigacao" className="hover:text-[#e2b13c] transition-colors">
                Sistemas de Irrigação
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#e2b13c] mb-5">
            Agromil Itu/SP
          </h3>
          <ul className="space-y-3.5 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#e2b13c] flex-shrink-0 mt-0.5" />
              <span>Av. Caetano Ruggieri, 2191 - Parque Res. Mayard, Itu - SP, 13310-160</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#e2b13c] flex-shrink-0" />
              <span>(11) 4023-3503</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#e2b13c] flex-shrink-0" />
              <span>contato@agromilitu.com.br</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <p>&copy; {currentYear} Agromil Agropecuária. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <span>Itu/SP - Terra dos Exageros</span>
        </div>
      </div>
    </footer>
  );
}
