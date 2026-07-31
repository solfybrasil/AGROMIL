"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Phone, MapPin, Loader, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, Eye, EyeOff, Check, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { clientAuth } from "@/lib/client-auth";
import { saveOnboardingPreferences } from "@/lib/recommendation-engine";

const STYLE_CATEGORIES = [
  { slug: "vestidos", name: "Vestidos", emoji: "👗", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" },
  { slug: "tops-blusas", name: "Tops & Blusas", emoji: "👚", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop" },
  { slug: "calcas-jeans", name: "Calcas & Jeans", emoji: "👖", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop" },
  { slug: "conjuntos", name: "Conjuntos", emoji: "✨", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop" },
  { slug: "acessorios", name: "Acessorios", emoji: "👜", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop" },
  { slug: "casacos", name: "Casacos & Blazers", emoji: "🧥", img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=400&auto=format&fit=crop" },
  { slug: "saias", name: "Saias", emoji: "💃", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop" },
  { slug: "moda-praia", name: "Moda Praia", emoji: "🌊", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop" },
  { slug: "lingerie", name: "Lingerie & Pijamas", emoji: "🌸", img: "https://images.unsplash.com/photo-1616245350936-11a379cd9fb8?q=80&w=400&auto=format&fit=crop" },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  // Sizes
  const [sizeTop, setSizeTop] = useState("");       // P, M, G etc
  const [sizeBottom, setSizeBottom] = useState(""); // 36, 38 etc
  const [sizeShoe, setSizeShoe] = useState("");     // 35, 36 etc
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Itu");
  const [stateName, setStateName] = useState("SP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (val: string) => {
    let c = val.replace(/\D/g, "").substring(0, 11);
    let f = c;
    if (c.length > 2) f = `(${c.substring(0, 2)}) ${c.substring(2)}`;
    if (c.length > 7) f = `(${c.substring(0, 2)}) ${c.substring(2, 7)}-${c.substring(7)}`;
    setPhone(f);
  };

  const handleZipCodeChange = async (cep: string) => {
    const c = cep.replace(/\D/g, "");
    setZipCode(c);
    if (c.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${c}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setStreet(data.logradouro || "");
            setNeighborhood(data.bairro || "");
            setCity(data.localidade || "Itu");
            setStateName(data.uf || "SP");
          }
        }
      } catch {}
    }
  };

  const toggleStyle = (slug: string) => {
    setSelectedStyles(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!name || !email || !password || !phone) { setError("Preencha todos os campos obrigatorios."); return; }
      if (password.length < 6) { setError("A senha deve ter ao menos 6 caracteres."); return; }
    }
    if (step === 2) {
      if (selectedStyles.length < 3) { setError("Selecione ao menos 3 estilos para personalizarmos seu feed."); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!zipCode || !street || !number || !neighborhood) { setError("Preencha os dados de entrega."); return; }
    setLoading(true);
    try {
      const res = await clientAuth.registerCustomer({
        name,
        email,
        password,
        phone,
        street,
        number,
        complement: complement || undefined,
        neighborhood,
        city: city || "Itu",
        state: stateName || "SP",
        zipCode,
      });
      if (res.ok) {
        const userId = res.customer?.id || res.user?.id || email;
        saveOnboardingPreferences(userId, selectedStyles, { sizeTop, sizeBottom, sizeShoe });
        router.push(redirect);
        router.refresh();
      } else {
        setError(res.error || "Erro ao criar conta.");
      }
    } catch { setError("Falha ao realizar cadastro. Tente novamente."); }
    finally { setLoading(false); }
  };

  const EDITORIAL_IMAGES = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=90&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=90&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=90&w=1200&auto=format&fit=crop",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
      <Header />

      <main className="flex-1 flex">
        {/* ── Left: Editorial image (hidden on mobile) ── */}
        <div className="hidden xl:flex xl:w-[420px] flex-shrink-0 relative overflow-hidden sticky top-0 h-screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={EDITORIAL_IMAGES[step - 1] || EDITORIAL_IMAGES[0]}
            alt="SILUET"
            className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-[#1A1A1A]/20" />
          <div className="relative z-10 flex flex-col justify-end p-10 h-full">
            <div className="space-y-3">
              <div className="flex gap-1.5 mb-4">
                {[1, 2, 3].map(i => (
                  <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-[#8B5E3C]" : "w-2 bg-white/30"}`} />
                ))}
              </div>
              <p className="text-[10px] font-black text-[#E5C3B0] uppercase tracking-widest">
                {step === 1 ? "Etapa 1 de 3 — Seus Dados" : step === 2 ? "Etapa 2 de 3 — Seu Estilo" : "Etapa 3 de 3 — Entrega"}
              </p>
              <h3 className="font-serif text-2xl text-white font-semibold leading-snug">
                {step === 1 ? "Vamos comecar sua jornada no SILUET." : step === 2 ? "Seu feed personalizado comeca aqui." : "Ultima etapa! Onde entregamos suas pecas?"}
              </h3>
            </div>
          </div>
        </div>

        {/* ── Right: Form content ── */}
        <div className="flex-1 flex flex-col">
          {/* Progress bar */}
          <div className="h-1 bg-[#F0EAE2]">
            <div className="h-full bg-[#8B5E3C] transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
          </div>

          <div className="flex-1 flex flex-col px-4 sm:px-8 lg:px-16 py-10 max-w-2xl mx-auto w-full">
            {/* Back / Logo row */}
            <div className="flex items-center justify-between mb-8">
              {step > 1 ? (
                <button onClick={() => { setStep(s => s - 1); setError(""); }} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8B5E3C] hover:text-[#2B2620] transition-colors cursor-pointer">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Voltar</span>
                </button>
              ) : (
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8B5E3C] hover:text-[#2B2620] transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Ja tenho conta</span>
                </Link>
              )}
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i <= step ? "bg-[#8B5E3C]" : "bg-[#E8DFD8]"}`} />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1: Dados Basicos ── */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <span className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest">Etapa 1 de 3</span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B2620] mt-1">Crie sua conta SILUET</h1>
                  <p className="text-xs text-[#7A6F63] mt-1.5">Preencha seus dados para comecar.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Nome Completo *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A8]" />
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo"
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl pl-10 py-3 pr-4 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">WhatsApp *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A8]" />
                      <input type="tel" required value={phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="(11) 99999-9999"
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl pl-10 py-3 pr-4 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">E-mail *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A8]" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com"
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl pl-10 py-3 pr-4 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Senha *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A8]" />
                      <input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 6 caracteres"
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl pl-10 py-3 pr-11 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C9B9A8] hover:text-[#8B5E3C] transition-colors cursor-pointer">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button onClick={handleNext}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#2B2620] hover:bg-[#8B5E3C] text-white font-bold text-sm tracking-wide shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.98]">
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ── STEP 2: Preferencias de Estilo (Pinterest Style) ── */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <span className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest">Etapa 2 de 3</span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B2620] mt-1">O que voce mais gosta?</h1>
                  <p className="text-xs text-[#7A6F63] mt-1.5">
                    Selecione ao menos <strong>3 estilos</strong> e criaremos um feed personalizado so para voce.
                  </p>
                </div>

                {/* Counter badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black transition-all ${selectedStyles.length >= 3 ? "bg-[#8B5E3C] text-white" : "bg-[#F0EAE2] text-[#8B5E3C]"}`}>
                    <Heart className="h-3 w-3" />
                    {selectedStyles.length} selecionado{selectedStyles.length !== 1 ? "s" : ""}
                    {selectedStyles.length >= 3 && " - Incrivel!"}
                  </span>
                  {selectedStyles.length < 3 && (
                    <span className="text-[11px] text-[#7A6F63]">({3 - selectedStyles.length} ainda)</span>
                  )}
                </div>

                {/* Style grid */}
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3">
                  {STYLE_CATEGORIES.map((cat) => {
                    const selected = selectedStyles.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleStyle(cat.slug)}
                        className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${selected ? "ring-[3px] ring-[#8B5E3C] scale-[0.97]" : "hover:scale-[1.02]"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className={`absolute inset-0 transition-all ${selected ? "bg-[#8B5E3C]/50" : "bg-black/30 group-hover:bg-black/20"}`} />

                        {selected && (
                          <div className="absolute top-2 right-2 bg-[#8B5E3C] text-white rounded-full p-1 shadow-md z-10">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                          <p className="text-white font-bold text-[11px] leading-tight text-center drop-shadow-sm">{cat.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ── Tamanhos da pessoa ── */}
                <div className="border-t border-[#EDE3D3] pt-5 space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#2B2620]">Seus tamanhos</h3>
                    <p className="text-[11px] text-[#7A6F63] mt-0.5">Assim mostramos pecas que servem em voce primeiro.</p>
                  </div>

                  {/* Tamanho de roupa (letra) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-2 uppercase tracking-wider">Tops, Vestidos & Blusas</label>
                    <div className="flex flex-wrap gap-2">
                      {["PP","P","M","G","GG","XGG","XGGG"].map(s => (
                        <button key={s} type="button" onClick={() => setSizeTop(sizeTop === s ? "" : s)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                            sizeTop === s
                              ? "border-[#8B5E3C] bg-[#8B5E3C] text-white"
                              : "border-[#E8DFD8] bg-white text-[#7A6F63] hover:border-[#8B5E3C] hover:text-[#8B5E3C]"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  {/* Tamanho de calca/saia (numeracao) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-2 uppercase tracking-wider">Calcas, Saias & Conjuntos</label>
                    <div className="flex flex-wrap gap-2">
                      {["34","36","38","40","42","44","46","48"].map(s => (
                        <button key={s} type="button" onClick={() => setSizeBottom(sizeBottom === s ? "" : s)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                            sizeBottom === s
                              ? "border-[#8B5E3C] bg-[#8B5E3C] text-white"
                              : "border-[#E8DFD8] bg-white text-[#7A6F63] hover:border-[#8B5E3C] hover:text-[#8B5E3C]"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  {/* Tamanho de calcado */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-2 uppercase tracking-wider">Calcado (opcional)</label>
                    <div className="flex flex-wrap gap-2">
                      {["33","34","35","36","37","38","39","40","41","42"].map(s => (
                        <button key={s} type="button" onClick={() => setSizeShoe(sizeShoe === s ? "" : s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                            sizeShoe === s
                              ? "border-[#8B5E3C] bg-[#8B5E3C] text-white"
                              : "border-[#E8DFD8] bg-white text-[#7A6F63] hover:border-[#8B5E3C] hover:text-[#8B5E3C]"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handleNext}
                  className={`w-full h-12 flex items-center justify-center gap-2 rounded-2xl font-bold text-sm tracking-wide shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.98] ${selectedStyles.length >= 3 ? "bg-[#2B2620] hover:bg-[#8B5E3C] text-white" : "bg-[#E8DFD8] text-[#7A6F63] cursor-not-allowed"}`}
                  disabled={selectedStyles.length < 3}>
                  <Sparkles className="h-4 w-4" />
                  <span>Criar Meu Feed Personalizado</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ── STEP 3: Endereco ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                <div>
                  <span className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest">Etapa 3 de 3</span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B2620] mt-1">Seu endereco de entrega</h1>
                  <p className="text-xs text-[#7A6F63] mt-1.5">Informe onde entregamos suas pecas favoritas.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">CEP *</label>
                      <input type="text" required maxLength={9} value={zipCode} onChange={(e) => handleZipCodeChange(e.target.value)} placeholder="00000-000"
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl py-3 px-3.5 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Rua *</label>
                      <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Av. Principal"
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl py-3 px-3.5 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Numero *</label>
                      <input type="text" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="450"
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl py-3 px-3.5 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Complemento</label>
                      <input type="text" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..."
                        className="w-full bg-white border border-[#E8DFD8] rounded-2xl py-3 px-3.5 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Bairro *</label>
                    <input type="text" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro"
                      className="w-full bg-white border border-[#E8DFD8] rounded-2xl py-3 px-3.5 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Cidade</label>
                      <input type="text" disabled value={city} className="w-full bg-[#F5F5F3] border border-[#E8DFD8] rounded-2xl py-3 px-3.5 text-sm text-[#7A6F63] font-medium cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Estado</label>
                      <input type="text" disabled value={stateName} className="w-full bg-[#F5F5F3] border border-[#E8DFD8] rounded-2xl py-3 px-3.5 text-sm text-[#7A6F63] font-medium cursor-not-allowed text-center" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#8B5E3C] hover:bg-[#2B2620] text-white font-bold text-sm tracking-wide shadow-sm transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.98]">
                  {loading ? (<><Loader className="h-4 w-4 animate-spin" /><span>Criando sua conta...</span></>) : (<><Sparkles className="h-4 w-4" /><span>Criar Minha Conta</span></>)}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#7A6F63] font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#8B5E3C]" />
                  <span>Seus dados estao protegidos com criptografia SILUET.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><span className="text-xs text-[#8B5E3C] font-bold animate-pulse">Carregando...</span></div>}>
      <RegisterForm />
    </Suspense>
  );
}
