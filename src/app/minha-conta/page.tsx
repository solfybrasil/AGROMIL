"use client";

import { useEffect, useState } from "react";
import { User, ClipboardList, MapPin, Award, ShoppingBag, ArrowRight, ShieldAlert, Sparkles, Building2, Package } from "lucide-react";
import Link from "next/link";
import { useAccount } from "./layout";

interface OrderSummary {
  id: string;
  createdAt: string;
  total: number;
  status: string;
}

export default function AccountDashboard() {
  const { session: profile } = useAccount();
  const [latestOrder, setLatestOrder] = useState<OrderSummary | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const loadDashboardData = async () => {
      try {
        // Fetch orders directly since token session cookie is checked by API
        const ordersRes = await fetch("/api/customer/orders");
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setOrderCount(orders.length);
          if (orders.length > 0) {
            // Sort by date desc
            const sorted = orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLatestOrder(sorted[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load account dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profile]);

  if (!profile) {
    return (
      <div className="text-center py-10 space-y-4">
        <ShieldAlert className="h-10 w-10 text-yellow-500 mx-auto" />
        <h3 className="text-xs font-black text-gray-800">Falha ao carregar perfil</h3>
        <p className="text-[10px] text-gray-400 font-semibold">Tente fazer o login novamente.</p>
      </div>
    );
  }

  // Format Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Novo</span>;
      case "CONFIRMED": return <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Confirmado</span>;
      case "PREPARING": return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Preparando</span>;
      case "SHIPPED": return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Enviado</span>;
      case "DELIVERED": return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Entregue</span>;
      case "CANCELLED": return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Cancelado</span>;
      default: return <span className="bg-gray-50 text-gray-700 border border-gray-100 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      
      {/* ── Welcome Header ── */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-black text-[#1b4332]">Olá, {profile.name.split(" ")[0]}!</h1>
        <p className="text-gray-400 font-semibold text-[11px]">Seja bem-vindo à sua área de cliente. Gerencie seus dados e acompanhe seus pedidos.</p>
      </div>

      {/* ── KPI cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* KPI 1: Plan type */}
        <div className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Categoria de Conta</span>
            <span className="text-sm font-black text-gray-800 flex items-center gap-1.5">
              {profile.planType === "PLANO" ? (
                <>
                  <Building2 className="h-4.5 w-4.5 text-emerald-600" />
                  <span>Plano Corporativo</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                  <span>Consumidor Comum</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <Link href="/minha-conta/pedidos" className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs hover:border-primary transition-all group">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pedidos Realizados</span>
            <span className="text-xl font-black text-gray-800">{orderCount}</span>
          </div>
          <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </Link>

        {/* KPI 3: Loyalty points */}
        <Link href="/minha-conta/fidelidade" className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs hover:border-amber-500 transition-all group">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pontos Fidelidade</span>
            <span className="text-xl font-black text-amber-600 flex items-center gap-1">
              {orderCount * 120} <span className="text-[10px] text-gray-400 font-bold">pontos</span>
            </span>
          </div>
          <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-amber-500/10 group-hover:text-amber-600 transition-colors">
            <Award className="h-5 w-5" />
          </div>
        </Link>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Latest Order Panel ── */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">Último Pedido</h3>
          
          {latestOrder ? (
            <div className="border border-gray-100 rounded-2xl p-4 space-y-4 shadow-3xs hover:border-gray-200 transition-all relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block">Identificador</span>
                  <span className="font-serif text-sm font-black text-gray-800">#{latestOrder.id.substring(latestOrder.id.length - 8).toUpperCase()}</span>
                </div>
                <div>
                  {getStatusBadge(latestOrder.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-gray-50 pt-3">
                <div>
                  <span className="text-gray-400 font-bold block">Realizado em:</span>
                  <span className="text-gray-700 font-black">{new Date(latestOrder.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block">Valor Total:</span>
                  <span className="text-gray-700 font-black">R$ {Number(latestOrder.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/minha-conta/pedidos/${latestOrder.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-primary hover:text-white transition-all text-gray-600 font-bold text-[10px] py-2 rounded-xl"
                >
                  <span>Detalhes do Rastreamento</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-250 rounded-2xl p-8 text-center space-y-3">
              <Package className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-gray-400 font-semibold">Nenhum pedido realizado ainda.</p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 bg-primary text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg"
              >
                <span>Ir para a Loja</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Shipping Address Summary ── */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">Endereço Principal</h3>
          
          <div className="border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-gray-800 block truncate">Residencial / Entrega Principal</span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                  {profile.street}, {profile.number} {profile.complement ? `- ${profile.complement}` : ""}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                  {profile.neighborhood} - {profile.city} / {profile.state}
                </span>
                <span className="text-[10px] text-gray-400 font-bold block mt-1">
                  CEP {profile.zipCode.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-3">
              <Link
                href="/minha-conta/enderecos"
                className="w-full inline-flex items-center justify-center gap-1 bg-gray-50 hover:bg-primary hover:text-white transition-all text-gray-600 font-bold text-[10px] py-2 rounded-xl"
              >
                <span>Editar Endereços</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ── Plan Advantages Panel ── */}
      <div className="bg-primary/[0.02] border border-primary/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            {profile.planType === "PLANO" ? "Benefícios Ativos" : "Upgrade de Conta"}
          </span>
          <h4 className="text-sm font-black text-gray-800">
            {profile.planType === "PLANO" 
              ? "Você faz parte do Plano Corporativo Agromil" 
              : "Desbloqueie faturamento e descontos especiais"}
          </h4>
          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
            {profile.planType === "PLANO" 
              ? "Aproveite descontos especiais faturados em sua conta corporativa, relatórios mensais e suporte técnico prioritário para compras em atacado." 
              : "Se você possui fazendas, condomínios ou trabalha com paisagismo, cadastre seu CNPJ/Plano Corporativo para receber descontos no faturamento mensal."}
          </p>
        </div>
        
        {profile.planType !== "PLANO" && (
          <Link
            href="/minha-conta/perfil"
            className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-bold text-xs px-4 py-2.5 rounded-xl self-start md:self-auto shadow-sm hover:shadow active:scale-98 transition-all"
          >
            <span>Quero ser Parceiro</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

    </div>
  );
}
