"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList, ArrowRight, ShoppingBag, MapPin, Calendar,
  Clock, ShoppingCart, User, CheckCircle2, Truck, Package,
  ShieldCheck, RefreshCcw, Bell, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { Suspense } from "react";

// ─── Status helpers ───────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string; step: number }> = {
  NEW:       { label: "Aguardando Confirmação", color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500",    step: 0 },
  CONFIRMED: { label: "Confirmado",             color: "text-indigo-700", bg: "bg-indigo-50",  border: "border-indigo-200", dot: "bg-indigo-500",  step: 1 },
  PREPARING: { label: "Em Preparação",          color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",  dot: "bg-amber-500",   step: 2 },
  SHIPPED:   { label: "A Caminho!",             color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200", dot: "bg-purple-500",  step: 3 },
  DELIVERED: { label: "Entregue ✓",             color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-500", step: 4 },
  CANCELLED: { label: "Cancelado",              color: "text-rose-700",   bg: "bg-rose-50",    border: "border-rose-200",   dot: "bg-rose-500",    step: -1 },
};

const TIMELINE_STEPS = [
  { key: "NEW",       label: "Recebido",   Icon: Clock },
  { key: "CONFIRMED", label: "Confirmado", Icon: ShieldCheck },
  { key: "PREPARING", label: "Preparando", Icon: Package },
  { key: "SHIPPED",   label: "A Caminho",  Icon: Truck },
  { key: "DELIVERED", label: "Entregue",   Icon: CheckCircle2 },
];

function MiniTimeline({ status }: { status: string }) {
  const currentStep = STATUS_META[status]?.step ?? 0;
  if (status === "CANCELLED") return null;

  return (
    <div className="flex items-center gap-0 mt-3">
      {TIMELINE_STEPS.map((step, idx) => {
        const isDone    = idx < currentStep;
        const isActive  = idx === currentStep;
        const isPending = idx > currentStep;
        const { Icon } = step;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDone   ? "bg-primary" :
                  isActive ? "bg-primary/20 ring-2 ring-primary ring-offset-1" :
                             "bg-gray-100"
                }`}
              >
                <Icon className={`h-3 w-3 ${isDone ? "text-white" : isActive ? "text-primary" : "text-gray-300"}`} />
              </div>
              <span className={`text-[8px] font-bold leading-none hidden sm:block ${
                isDone ? "text-primary" : isActive ? "text-primary" : "text-gray-300"
              }`}>{step.label}</span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 transition-colors duration-500 ${isDone ? "bg-primary" : "bg-gray-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Toast Component ───────────────────────────────────────────
function SuccessToast({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-[#1b4332] text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 max-w-sm border border-[#2d6a4f]">
        <div className="bg-emerald-400/20 p-2 rounded-full flex-shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-white">Pedido realizado com sucesso!</p>
          <p className="text-[10px] text-emerald-300 font-bold truncate mt-0.5">
            #{orderId} — Acompanhe abaixo em tempo real
          </p>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg font-bold flex-shrink-0">×</button>
      </div>
    </div>
  );
}

// ─── Main Page (inner, wrapped in Suspense) ────────────────────
function CustomerOrdersPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const newOrderId   = searchParams.get("novo");
  const { addItem }  = useCartStore();

  const [session,        setSession]        = useState<any>(null);
  const [orders,         setOrders]         = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [polling,        setPolling]        = useState(false);
  const [showToast,      setShowToast]      = useState(!!newOrderId);
  const [lastUpdated,    setLastUpdated]    = useState<Date | null>(null);

  const newOrderRef = useRef<HTMLDivElement | null>(null);

  // ── Fetch session + orders ────────────────────────────────────
  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setPolling(true);

    try {
      const ordersRes = await fetch("/api/customer/orders");
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn("Failed to reload orders:", err);
    } finally {
      if (!silent) setLoading(false);
      else setPolling(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch("/api/customer/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.session) {
            setSession(meData.session);
            await loadOrders(false);
          }
        }
      } catch (err) {
        console.warn("Session load failed", err);
      } finally {
        setSessionLoading(false);
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Polling every 10s ─────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => loadOrders(true), 10000);
    return () => clearInterval(interval);
  }, [session]);

  // ── Auto-scroll to new order ──────────────────────────────────
  useEffect(() => {
    if (newOrderId && newOrderRef.current) {
      setTimeout(() => {
        newOrderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [newOrderId, orders]);

  const handleLogout = async () => {
    if (!confirm("Deseja realmente sair da sua conta?")) return;
    try {
      await fetch("/api/customer/logout", { method: "POST" });
      setSession(null);
      setOrders([]);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleRepeatOrder = (order: any) => {
    if (!order.items?.length) return;
    order.items.forEach((item: any) => {
      const prod = item.product || {
        id: item.productId, name: item.productName || "Produto", price: item.price, images: [],
      };
      addItem(prod, item.quantity);
    });
    router.push("/carrinho");
  };

  // ── Loading state ─────────────────────────────────────────────
  if (sessionLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <CategoryMenu />
        <main className="flex-1 flex flex-col items-center justify-center py-20 select-none gap-3">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <span key={i} className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400 animate-pulse">Carregando seus pedidos...</span>
        </main>
        <Footer />
      </div>
    );
  }

  const activeOrders = orders.filter(o => ["NEW","CONFIRMED","PREPARING","SHIPPED"].includes(o.status));
  const pastOrders   = orders.filter(o => ["DELIVERED","CANCELLED"].includes(o.status));

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
      <Header />
      <CategoryMenu />

      {/* Toast */}
      {showToast && newOrderId && (
        <SuccessToast orderId={newOrderId} onClose={() => setShowToast(false)} />
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 select-none">

        {/* ── Not logged in ── */}
        {!session ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-6">
            <div className="bg-primary/10 text-primary p-5 rounded-full inline-block mb-2">
              <ClipboardList className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-black text-[#1b4332]">Meus Pedidos</h1>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Faça login para acompanhar seus pedidos em tempo real.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2.5 items-center">
              <Link
                href="/login?redirect=/pedidos"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-all"
              >
                <span>Entrar na Minha Conta</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/cadastro?redirect=/pedidos" className="text-xs text-primary hover:underline font-bold">
                Criar conta grátis
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── Header profile bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="space-y-1">
                <h1 className="font-serif text-3xl font-black text-[#1b4332]">Meus Pedidos</h1>
                <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>{session.name} · {session.email}</span>
                  {lastUpdated && (
                    <span className="flex items-center gap-1 ml-2">
                      {polling
                        ? <RefreshCcw className="h-2.5 w-2.5 text-primary animate-spin" />
                        : <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                      }
                      <span className="text-gray-300">{lastUpdated.toLocaleTimeString("pt-BR")}</span>
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="self-start text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider"
              >
                Sair da Conta
              </button>
            </div>

            {/* ── No orders ── */}
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4">
                <div className="bg-gray-100 p-4 rounded-full inline-block text-gray-400">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Nenhum pedido realizado</h3>
                <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto">
                  Você ainda não fez nenhum pedido. Navegue pelas categorias e garanta os melhores preços!
                </p>
                <Link href="/" className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-sm transition-all mt-2">
                  Ir para as Compras
                </Link>
              </div>
            ) : (
              <div className="space-y-10">

                {/* ── Active orders ── */}
                {activeOrders.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xs font-black text-[#1b4332] uppercase tracking-widest flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-500 animate-pulse" />
                      Pedidos em Andamento
                      <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-black">
                        {activeOrders.length}
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                      {activeOrders.map((order) => {
                        const meta        = STATUS_META[order.status] || STATUS_META.NEW;
                        const isNew       = order.id === newOrderId;
                        const date        = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                        });
                        const itemsSummary = order.items
                          ?.slice(0, 3)
                          .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || "Item"}`)
                          .join(", ");
                        const extraItems  = (order.items?.length || 0) - 3;

                        return (
                          <div
                            key={order.id}
                            ref={isNew ? newOrderRef : null}
                            className={`bg-white rounded-3xl border p-5 shadow-2xs transition-all duration-500 ${
                              isNew
                                ? "border-primary ring-2 ring-primary/30 ring-offset-2 shadow-md"
                                : `${meta.border}`
                            }`}
                          >
                            {/* Card header */}
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                    #{order.id}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${order.status !== "DELIVERED" ? "animate-pulse" : ""}`} />
                                    {meta.label}
                                  </span>
                                  {isNew && (
                                    <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                                      Novo!
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                                  <Calendar className="h-3 w-3" />
                                  {date}
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block">Total</span>
                                <span className="text-base font-black text-[#1b4332]">
                                  R$ {Number(order.total).toFixed(2).replace(".", ",")}
                                </span>
                              </div>
                            </div>

                            {/* Items preview */}
                            <p className="text-xs font-semibold text-gray-600 leading-relaxed truncate mb-1">
                              {itemsSummary}
                              {extraItems > 0 && <span className="text-gray-400"> +{extraItems} mais</span>}
                            </p>

                            {/* Address */}
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-3">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {order.street}, {order.number} — {order.neighborhood}, {order.city}
                              </span>
                            </div>

                            {/* Mini timeline */}
                            <MiniTimeline status={order.status} />

                            {/* CTA */}
                            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                              <Link
                                href={`/pedidos/${order.id}`}
                                className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-bold text-[10px] py-2 px-4 rounded-xl shadow-xs transition-all uppercase tracking-wider"
                              >
                                Acompanhar em Tempo Real
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── Past orders ── */}
                {pastOrders.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Histórico de Pedidos
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                      {pastOrders.map((order) => {
                        const meta = STATUS_META[order.status] || STATUS_META.DELIVERED;
                        const date = new Date(order.createdAt).toLocaleDateString("pt-BR");
                        const itemsSummary = order.items
                          ?.slice(0, 2)
                          .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || "Item"}`)
                          .join(", ");
                        const extraItems = (order.items?.length || 0) - 2;

                        return (
                          <div
                            key={order.id}
                            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{order.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                                  {meta.label}
                                </span>
                                <span className="text-[10px] text-gray-300 font-bold">{date}</span>
                              </div>
                              <p className="text-xs font-semibold text-gray-500 truncate">
                                {itemsSummary}
                                {extraItems > 0 && <span className="text-gray-300"> +{extraItems} mais</span>}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-sm font-black text-gray-700">
                                R$ {Number(order.total).toFixed(2).replace(".", ",")}
                              </span>
                              <button
                                onClick={() => handleRepeatOrder(order)}
                                className="inline-flex items-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-[10px] py-1.5 px-3 rounded-xl transition-all"
                                title="Adicionar itens ao carrinho"
                              >
                                <ShoppingCart className="h-3 w-3 text-primary" />
                                Repetir
                              </button>
                              <Link
                                href={`/pedidos/${order.id}`}
                                className="inline-flex items-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-[10px] py-1.5 px-3 rounded-xl transition-all"
                              >
                                Detalhes
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

              </div>
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ─── Export wrapped in Suspense (required for useSearchParams) ──
export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <CategoryMenu />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    }>
      <CustomerOrdersPageInner />
    </Suspense>
  );
}
