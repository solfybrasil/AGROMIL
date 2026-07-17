"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MapPin,
  Phone,
  CreditCard,
  Zap,
  Landmark,
  StickyNote,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface OrderTrackingPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS = [
  {
    key: "NEW",
    label: "Pedido Recebido",
    description: "Seu pedido chegou e está aguardando confirmação da loja.",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-100",
    ring: "ring-blue-400",
  },
  {
    key: "CONFIRMED",
    label: "Pedido Confirmado",
    description: "A loja confirmou seu pedido e está separando os itens.",
    icon: ShieldCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    ring: "ring-indigo-400",
  },
  {
    key: "PREPARING",
    label: "Em Preparação",
    description: "Seus produtos estão sendo embalados com cuidado.",
    icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-100",
    ring: "ring-amber-400",
  },
  {
    key: "SHIPPED",
    label: "A Caminho!",
    description: "Seu pedido saiu para entrega e está chegando até você.",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-100",
    ring: "ring-purple-400",
  },
  {
    key: "DELIVERED",
    label: "Entregue!",
    description: "Pedido entregue com sucesso. Aproveite!",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    ring: "ring-emerald-400",
  },
];

const CANCELLED_STEP = {
  key: "CANCELLED",
  label: "Pedido Cancelado",
  description: "Este pedido foi cancelado. Entre em contato para mais informações.",
  icon: XCircle,
  color: "text-rose-600",
  bg: "bg-rose-100",
  ring: "ring-rose-400",
};

function getPaymentInfo(method: string) {
  switch (method) {
    case "pix":
      return { label: "Pix", Icon: Zap, color: "text-teal-600" };
    case "card_on_delivery":
      return { label: "Cartão na Entrega", Icon: CreditCard, color: "text-blue-600" };
    case "money":
      return { label: "Dinheiro", Icon: Landmark, color: "text-emerald-600" };
    default:
      return { label: method, Icon: CreditCard, color: "text-gray-600" };
  }
}

function LoaderPulse() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function OrderTrackingPageInner({ params }: OrderTrackingPageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get("novo") === "1";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [polling, setPolling] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(isNewOrder);

  // Auto-hide success banner after 8s
  useEffect(() => {
    if (!isNewOrder) return;
    const t = setTimeout(() => setShowSuccessBanner(false), 8000);
    return () => clearTimeout(t);
  }, [isNewOrder]);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    else setPolling(true);

    try {
      const res = await fetch(`/api/pedidos/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setError("");
        setLastUpdated(new Date());
      } else {
        setError("Pedido não encontrado ou acesso restrito.");
      }
    } catch (err) {
      console.warn("Failed to fetch order tracking:", err);
      if (!silent) setError("Erro ao carregar pedido.");
    } finally {
      if (!silent) setLoading(false);
      else setPolling(false);
    }
  };

  useEffect(() => {
    fetchOrder(false);

    // Poll every 10 seconds for real-time status updates
    const interval = setInterval(() => fetchOrder(true), 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafaf9]">
        <Header />
        <CategoryMenu />
        <main className="flex-1 flex flex-col items-center justify-center py-20 select-none gap-4">
          <LoaderPulse />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Carregando rastreamento...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafaf9]">
        <Header />
        <CategoryMenu />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center select-none space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-full text-amber-600 inline-block">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-2xl font-black text-gray-800">Pedido não encontrado</h1>
          <p className="text-xs text-gray-400 font-semibold max-w-sm">
            Não conseguimos localizar o pedido <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{orderId}</code> no sistema.
          </p>
          <Link
            href="/pedidos"
            className="mt-2 inline-flex items-center gap-1.5 bg-primary text-white font-bold text-xs py-2.5 px-6 rounded-xl hover:bg-[#122e22] transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para Meus Pedidos
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const payInfo = getPaymentInfo(order.paymentMethod);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
      <Header />
      <CategoryMenu />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 select-none space-y-6">

        {/* ✅ Success banner — shown only right after checkout */}
        {showSuccessBanner && (
          <div className="bg-[#1b4332] text-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg border border-[#2d6a4f] animate-fade-in-up">
            <div className="bg-emerald-400/20 p-2.5 rounded-full flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold">Pedido realizado com sucesso! 🎉</p>
              <p className="text-[11px] text-emerald-300 font-bold mt-0.5">
                Acompanhe o status em tempo real aqui abaixo. Atualizamos a cada 10 segundos.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-white/40 hover:text-white text-lg font-bold flex-shrink-0 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <Link href="/pedidos" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-xl font-extrabold text-[#1b4332]">Rastrear Pedido</h1>
            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <span className="font-extrabold text-primary">#{order.id}</span>
              {lastUpdated && (
                <span className="ml-2 flex items-center gap-1">
                  {polling ? (
                    <RefreshCcw className="h-3 w-3 text-primary animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  )}
                  Atualizado: {lastUpdated.toLocaleTimeString("pt-BR")}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-2xs">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">
            Status do Pedido
          </h2>

          {isCancelled ? (
            /* Cancelled State */
            <div className="flex items-start gap-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <div className={`p-2.5 rounded-full ${CANCELLED_STEP.bg} flex-shrink-0`}>
                <CANCELLED_STEP.icon className={`h-5 w-5 ${CANCELLED_STEP.color}`} />
              </div>
              <div>
                <p className={`text-sm font-extrabold ${CANCELLED_STEP.color}`}>{CANCELLED_STEP.label}</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">{CANCELLED_STEP.description}</p>
                <a
                  href="https://wa.me/551140233503"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#25d366] text-white px-3 py-1.5 rounded-lg hover:bg-[#20ba5a] transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          ) : (
            /* Progress Timeline */
            <ol className="relative">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                const isPending = idx > currentStepIdx;
                const StepIcon = step.icon;
                const isLast = idx === STATUS_STEPS.length - 1;

                return (
                  <li key={step.key} className="flex gap-4">
                    {/* Line + Icon Column */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all duration-500 ${
                          isDone
                            ? "bg-primary shadow-sm"
                            : isActive
                            ? `${step.bg} ring-2 ${step.ring} ring-offset-2 shadow-md`
                            : "bg-gray-100"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <StepIcon
                            className={`h-5 w-5 ${isActive ? step.color : "text-gray-300"} ${isActive ? "animate-pulse" : ""}`}
                          />
                        )}
                      </div>
                      {/* Vertical connector */}
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 my-1 transition-colors duration-500 ${
                            isDone ? "bg-primary" : "bg-gray-200"
                          }`}
                          style={{ minHeight: "28px" }}
                        />
                      )}
                    </div>

                    {/* Text Content */}
                    <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
                      <p
                        className={`text-sm font-extrabold leading-tight ${
                          isDone
                            ? "text-primary"
                            : isActive
                            ? step.color
                            : "text-gray-300"
                        }`}
                      >
                        {step.label}
                        {isActive && (
                          <span className="ml-2 text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase">
                            atual
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-[11px] font-semibold mt-0.5 leading-snug ${
                          isActive || isDone ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Delivery Address */}
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Endereço de Entrega
            </div>
            <div className="text-xs text-gray-700 font-semibold leading-relaxed">
              <p className="font-extrabold text-gray-900">{order.clientName}</p>
              <p className="mt-0.5">{order.street}, N° {order.number}{order.complement ? ` (${order.complement})` : ""}</p>
              <p>{order.neighborhood} — {order.city}/{order.state}</p>
              <p className="text-gray-400">CEP {order.zipCode}</p>
            </div>
            <a
              href={`https://wa.me/55${order.clientPhone?.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg w-fit mt-1 hover:bg-emerald-100 transition-colors"
            >
              <Phone className="h-3 w-3" />
              {order.clientPhone}
            </a>
          </div>

          {/* Payment + Total */}
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-wider">
              <payInfo.Icon className={`h-3.5 w-3.5 ${payInfo.color}`} />
              Pagamento
            </div>
            <div className="space-y-1.5 text-xs font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Método</span>
                <span className={`font-extrabold ${payInfo.color}`}>{payInfo.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">R$ {Number(order.subtotal).toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-bold text-gray-800">
                  {Number(order.deliveryFee) === 0
                    ? <span className="text-emerald-600 font-extrabold">Grátis</span>
                    : `R$ ${Number(order.deliveryFee).toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-sm">
                <span className="font-black text-gray-800">Total</span>
                <span className="font-black text-primary">R$ {Number(order.total).toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <StickyNote className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1">Observações</p>
              <p className="text-xs font-semibold text-amber-800 italic">"{order.notes}"</p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white border border-gray-150 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
              Itens do Pedido ({order.items?.length || 0})
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {(order.items || []).map((item: any, idx: number) => {
              const name = item.productName || item.product?.name || "Produto";
              const unitPrice = Number(item.price).toFixed(2).replace(".", ",");
              const lineTotal = (Number(item.price) * item.quantity).toFixed(2).replace(".", ",");
              return (
                <div key={item.id || idx} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg flex-shrink-0">
                      ×{item.quantity}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-gray-800 leading-tight">{name}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        R$ {unitPrice} cada
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 flex-shrink-0">
                    R$ {lineTotal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Realtime hint */}
        <p className="text-center text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Página atualizada automaticamente a cada 10 segundos
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#fafaf9] items-center justify-center gap-3">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <span key={i} className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
        </div>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Carregando rastreamento...</span>
      </div>
    }>
      <OrderTrackingPageInner params={params} />
    </Suspense>
  );
}

