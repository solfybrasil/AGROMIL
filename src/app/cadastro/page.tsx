"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Phone, MapPin, Loader, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Itu");
  const [state, setState] = useState("SP");
  const [planType, setPlanType] = useState("COMUM");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZipCodeChange = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    setZipCode(cleaned);

    if (cleaned.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setStreet(data.logradouro || "");
            setNeighborhood(data.bairro || "");
            setCity(data.localidade || "Itu");
            setState(data.uf || "SP");
            setError("");
          } else {
            setError("CEP não encontrado.");
          }
        }
      } catch (err) {
        console.warn("Failed to lookup CEP:", err);
      }
    }
  };

  const handlePhoneChange = (val: string) => {
    // Format: (XX) XXXXX-XXXX
    let cleaned = val.replace(/\D/g, "");
    if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    }
    if (cleaned.length > 7) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !password || !phone || !zipCode || !street || !number || !neighborhood) {
      setError("Por favor, preencha todos os campos obrigatórios (*).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          street,
          number,
          complement: complement || null,
          neighborhood,
          city,
          state,
          zipCode,
          planType,
        }),
      });

      if (res.ok) {
        // Redirect back to page or checkout
        router.push(redirect);
        router.refresh();
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao criar conta.");
      }
    } catch (err) {
      console.error("Cadastro request failed:", err);
      setError("Falha de conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
      <Header />
      <CategoryMenu />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full bg-white border border-gray-100 rounded-3xl shadow-3xs p-8 hover:shadow-2xs transition-all duration-300 space-y-6">
          {/* Form Header */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-black text-[#1b4332] tracking-tight">Criar Sua Conta</h1>
            <p className="text-xs text-gray-400 font-semibold">
              Preencha seus dados para acompanhar pedidos e obter descontos exclusivos no marketplace Agromil.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Plan Selector Grid */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Escolha a categoria da sua conta</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Retail Option */}
                <button
                  type="button"
                  onClick={() => setPlanType("COMUM")}
                  className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-350 cursor-pointer ${
                    planType === "COMUM"
                      ? "bg-primary/[0.03] border-primary ring-2 ring-primary/10 shadow-xs"
                      : "bg-white border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${planType === "COMUM" ? "bg-primary text-white border-primary" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-gray-800 uppercase tracking-wider">Consumidor Comum</span>
                    <span className="block text-[10px] text-gray-400 font-semibold mt-1">Compras avulsas no varejo, entregas rápidas na região de Itu/SP e acompanhamento digital de pedidos.</span>
                  </div>
                </button>

                {/* Wholesale/Corporate Option */}
                <button
                  type="button"
                  onClick={() => setPlanType("PLANO")}
                  className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-350 cursor-pointer ${
                    planType === "PLANO"
                      ? "bg-emerald-500/[0.03] border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs"
                      : "bg-white border-gray-250 hover:border-gray-300"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${planType === "PLANO" ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      Plano Corporativo / Parceiro
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">Descontos</span>
                    </span>
                    <span className="block text-[10px] text-gray-400 font-semibold mt-1">Faturado para empresas, faturamento facilitado, frete programado grátis e descontos exclusivos de atacado.</span>
                  </div>
                </button>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
              
              {/* Column 1: Personal Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  Dados de Identificação
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Nome Completo / Razão Social *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João da Silva / Agromil SA"
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">WhatsApp / Telefone de Contato *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">E-mail *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Senha de Acesso *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crie uma senha de acesso"
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Address Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Local de Entrega
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">CEP *</label>
                    <input
                      type="text"
                      required
                      maxLength={9}
                      value={zipCode}
                      onChange={(e) => handleZipCodeChange(e.target.value)}
                      placeholder="13300-000"
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Rua / Logradouro *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Av. Dom Pedro I"
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 450"
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Sala, Andar, Galpão..."
                      className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro da entrega"
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Cidade</label>
                    <input
                      type="text"
                      disabled
                      value={city}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-500 font-semibold cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Estado</label>
                    <input
                      type="text"
                      disabled
                      value={state}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-500 font-semibold cursor-not-allowed text-center"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-6 flex flex-col items-center justify-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-sm inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-black text-xs py-3.5 rounded-xl shadow-sm hover:shadow active:scale-98 transition-all cursor-pointer uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Criando sua conta...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Minha Conta</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-gray-400 font-semibold">
                Já possui cadastro?{" "}
                <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary hover:underline font-bold">
                  Conecte-se aqui
                </Link>
              </p>
            </div>
          </form>

          {/* Secure details */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Seus dados cadastrais estão protegidos pela criptografia Agromil.</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center select-none">
        <span className="text-xs text-gray-400 font-bold animate-pulse">Carregando formulário...</span>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
