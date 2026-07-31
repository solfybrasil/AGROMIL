"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowLeft, Loader, ShieldAlert, Eye, EyeOff, Sparkles } from "lucide-react";
import Link from "next/link";
import { clientAuth } from "@/lib/client-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isAdminParam = searchParams.get("admin") === "true";

  const [tab, setTab] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTab(isAdminParam ? "admin" : "customer"); }, [isAdminParam]);

  useEffect(() => {
    const check = async () => {
      try {
        const custSession = await clientAuth.getCustomerSession();
        if (custSession) { router.push(redirect); return; }
        const adminSession = await clientAuth.getAdminSession();
        if (adminSession) router.push("/admin");
      } catch {}
    };
    check();
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "customer") {
        const res = await clientAuth.loginCustomer(email, password);
        if (res.ok) { router.push(redirect); router.refresh(); }
        else setError(res.error || "E-mail ou senha incorretos.");
      } else {
        const res = await clientAuth.loginAdmin(email, password);
        if (res.ok) { router.push("/admin"); router.refresh(); }
        else setError(res.error || "Credenciais de administrador incorretas.");
      }
    } catch { setError("Erro ao conectar. Tente novamente."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex select-none">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=90&w=1200&auto=format&fit=crop" alt="SILUET Atelier" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/75 via-[#2B2620]/45 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <span className="text-[10px] font-black text-[#EDE3D3]/50 uppercase tracking-[0.4em]">SILUET ATELIER</span>
          <div className="space-y-5">
            <p className="text-[11px] font-bold text-[#E5C3B0] uppercase tracking-widest">Moda que conta historias</p>
            <h2 className="font-serif text-4xl xl:text-5xl font-semibold text-white leading-tight">
              Design atemporal.<br />
              <span className="italic text-[#E5C3B0] font-normal">Beleza autentica.</span>
            </h2>
            <p className="text-sm text-[#EDE3D3]/70 font-normal max-w-xs leading-relaxed">
              Descubra pecas que refletem quem voce e. Cada colecao e uma celebracao da feminilidade contemporanea.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="w-8 h-1 bg-[#8B5E3C] rounded-full" />
            <span className="w-2 h-1 bg-[#EDE3D3]/30 rounded-full" />
            <span className="w-2 h-1 bg-[#EDE3D3]/30 rounded-full" />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-[#FAFAF8] flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-12 relative">
        <div className="absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8B5E3C] hover:text-[#2B2620] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para a Loja</span>
          </Link>
        </div>

        <div className="max-w-sm mx-auto w-full space-y-7 animate-fade-in-up">
          <div className="text-center space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="SILUET" className="h-14 w-auto object-contain mx-auto" />
            <p className="text-[9px] font-black text-[#8B5E3C] uppercase tracking-[0.35em]">
              {tab === "customer" ? "Portal da Cliente" : "Acesso Administrativo"}
            </p>
          </div>

          <div className="bg-[#F0EAE2] p-1 rounded-2xl flex gap-1">
            {([{ key: "customer", label: "Minha Conta" }, { key: "admin", label: "Administrador" }] as const).map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${tab === t.key ? "bg-white text-[#2B2620] shadow-xs" : "text-[#8B5E3C]/60 hover:text-[#8B5E3C]"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-semibold text-[#2B2620] tracking-tight">
              {tab === "customer" ? "Bem-vinda de volta" : "Acesso Restrito"}
            </h1>
            <p className="text-xs text-[#7A6F63] leading-relaxed">
              {tab === "customer" ? "Entre para ver suas recomendacoes personalizadas e acompanhar seus pedidos." : "Apenas para administradores e operadores autorizados."}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A8]" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={tab === "customer" ? "seuemail@exemplo.com" : "admin@siluet.com.br"}
                  className="w-full bg-white border border-[#E8DFD8] rounded-2xl pl-10 py-3 pr-4 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all placeholder:text-[#C9B9A8]" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#7A6F63] mb-1.5 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A8]" />
                <input id="password" type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="..." className="w-full bg-white border border-[#E8DFD8] rounded-2xl pl-10 py-3 pr-11 text-sm text-[#2B2620] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C9B9A8] hover:text-[#8B5E3C] transition-colors cursor-pointer">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#2B2620] hover:bg-[#8B5E3C] text-white font-bold text-sm tracking-wide shadow-sm transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.98]">
              {loading ? (<><Loader className="h-4 w-4 animate-spin" /><span>Verificando...</span></>) : (<><Sparkles className="h-4 w-4" /><span>{tab === "customer" ? "Entrar na Minha Conta" : "Entrar no Painel"}</span></>)}
            </button>
          </form>

          {tab === "customer" ? (
            <div className="pt-4 border-t border-[#EDE3D3] text-center">
              <p className="text-xs text-[#7A6F63]">Ainda nao tem conta?{" "}
                <Link href={`/cadastro?redirect=${encodeURIComponent(redirect)}`} className="text-[#8B5E3C] hover:text-[#2B2620] font-bold transition-colors">Crie a sua agora, e gratis</Link>
              </p>
            </div>
          ) : (
            <div className="pt-4 border-t border-[#EDE3D3] flex gap-2 items-center justify-center text-[10px] text-amber-600 font-bold">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>Use as credenciais administrativas configuradas no .env</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><span className="text-xs text-[#8B5E3C] font-bold animate-pulse">Carregando...</span></div>}>
      <LoginForm />
    </Suspense>
  );
}
