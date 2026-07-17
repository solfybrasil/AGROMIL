"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowLeft, Loader, User, ShieldAlert } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isAdminParam = searchParams.get("admin") === "true";

  const [tab, setTab] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Set active tab based on query param
  useEffect(() => {
    if (isAdminParam) {
      setTab("admin");
    } else {
      setTab("customer");
    }
  }, [isAdminParam]);

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/customer/me");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            router.push(redirect);
            return;
          }
        }

        const adminRes = await fetch("/api/auth/me");
        if (adminRes.ok) {
          router.push("/admin");
        }
      } catch (err) {
        console.warn("Session check failed", err);
      }
    };
    checkSession();
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = tab === "customer" ? "/api/customer/login" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const target = tab === "customer" ? redirect : "/admin";
        router.push(target);
        router.refresh();
      } else {
        setError(data.error || "E-mail ou senha incorretos.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 select-none relative">
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b4332] hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para a Loja</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* Brand visual logo */}
        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Agromil Logo"
            className="h-16 w-auto object-contain mb-1"
          />
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            {tab === "customer" ? "Portal do Cliente" : "Acesso Administrativo"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 py-8 px-6 shadow-3xs rounded-3xl sm:px-10 hover:shadow-2xs transition-all duration-300">
          
          <div className="mb-6 text-center space-y-1">
            <h2 className="text-lg font-black text-[#1b4332] tracking-tight">
              {tab === "customer" ? "Acesse sua conta" : "Acesso Restrito"}
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
              {tab === "customer"
                ? "Digite seus dados para acompanhar seus pedidos e comprar rápido."
                : "Apenas para administradores e operadores autorizados."}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold text-gray-500 mb-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tab === "customer" ? "seuemail@exemplo.com" : "admin@agromil.com.br"}
                  className="w-full bg-white border border-gray-250 rounded-xl pl-9 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-bold text-gray-500 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-250 rounded-xl pl-9 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl bg-[#1b4332] hover:bg-[#122e22] text-white font-bold text-xs shadow-sm hover:shadow hover-lift active-pop transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>{tab === "customer" ? "Entrar na Conta" : "Entrar no Painel"}</span>
                )}
              </button>
            </div>
          </form>

          {/* Conditional Sign-up link for customer, and Hint for Admin */}
          {tab === "customer" ? (
            <div className="mt-5 pt-5 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-semibold">
                Ainda não tem conta?{" "}
                <Link href={`/cadastro?redirect=${encodeURIComponent(redirect)}`} className="text-[#1b4332] hover:underline font-bold">
                  Cadastre-se grátis
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-5 pt-5 border-t border-gray-100 text-center flex gap-1.5 items-center justify-center text-[10px] text-amber-600 font-bold leading-relaxed">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
              <span>Dica: Use as credenciais administrativas configuradas no .env</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center select-none">
        <span className="text-xs text-gray-400 font-bold animate-pulse">Carregando painel de acesso...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
