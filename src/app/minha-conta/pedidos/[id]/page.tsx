"use client";

import { useEffect, useState, use } from "react";
import { ClipboardList, ArrowLeft, Calendar, DollarSign, MapPin, Truck, ShieldAlert, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  paymentMethod: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryFee: number;
  subtotal: number;
  notes?: string;
  items: OrderItem[];
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/pedidos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10 space-y-4">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-xs font-black text-gray-800">Pedido não encontrado</h3>
        <p className="text-[10px] text-gray-400 font-semibold">O link pode ter expirado ou o pedido não pertence à sua conta.</p>
        <Link
          href="/minha-conta/pedidos"
          className="inline-flex items-center gap-1.5 bg-primary text-white font-bold text-[10px] px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Pedidos</span>
        </Link>
      </div>
    );
  }

  // Timeline steps
  const steps = [
    { key: "NEW", label: "Novo", color: "bg-blue-500 text-blue-600" },
    { key: "CONFIRMED", label: "Confirmado", color: "bg-purple-500 text-purple-600" },
    { key: "PREPARING", label: "Em Preparo", color: "bg-amber-500 text-amber-600" },
    { key: "SHIPPED", label: "Enviado", color: "bg-indigo-500 text-indigo-600" },
    { key: "DELIVERED", label: "Entregue", color: "bg-emerald-500 text-emerald-600" },
  ];

  // Index of current status
  const currentStepIdx = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-8 font-sans text-xs">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
        <Link
          href="/minha-conta/pedidos"
          className="h-8 w-8 border border-gray-250 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] flex items-center gap-2">
            Detalhes do Pedido
          </h1>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Identificador: #{order.id.substring(order.id.length - 8).toUpperCase()}</p>
        </div>
      </div>

      {/* ── Order Status Timeline ── */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 shadow-3xs space-y-4">
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider text-center">Status de Acompanhamento</h3>
        
        {isCancelled ? (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center text-rose-800 font-black flex items-center justify-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <span>PEDIDO CANCELADO</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 relative">
            {/* Connection Line */}
            <div className="absolute top-8 left-6 right-6 h-0.5 bg-gray-250 hidden md:block" />
            
            {steps.map((step, idx) => {
              const completed = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 z-10">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                    completed 
                      ? "bg-primary text-white scale-110 shadow-xs" 
                      : "bg-white text-gray-400 border-2 border-gray-250"
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="text-left md:text-center">
                    <span className={`block font-black uppercase text-[9px] tracking-wider ${completed ? "text-primary" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                    {active && (
                      <span className="block text-[8px] text-primary/70 font-semibold animate-pulse mt-0.5">Status Atual</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Grid: Items list & Delivery/Payment details ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Order items (col-span-2) */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-primary" />
            Itens do Pedido
          </h3>

          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden shadow-3xs">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-bold text-gray-800 block truncate">{item.productName || `Produto ID ${item.productId.substring(0, 8)}`}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                    Qtd: {item.quantity} x R$ {Number(item.price).toFixed(2)}
                  </span>
                </div>
                <div className="font-black text-gray-800 text-right flex-shrink-0">
                  R$ {(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-2">
            <div className="flex justify-between text-gray-500 font-bold">
              <span>Subtotal:</span>
              <span>R$ {Number(order.subtotal || (order.total - order.deliveryFee)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-bold">
              <span>Frete:</span>
              <span>R$ {Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-850 font-black text-sm pt-2 border-t border-gray-200">
              <span>Total Pago:</span>
              <span className="text-primary">R$ {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping & Payment (col-span-1) */}
        <div className="space-y-6">
          
          {/* Delivery Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              Local de Entrega
            </h3>

            <div className="border border-gray-100 rounded-2xl p-4 shadow-3xs space-y-2.5">
              <div>
                <span className="font-bold text-gray-800 block">Endereço da entrega</span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-1 leading-relaxed">
                  {order.street}, {order.number} {order.complement ? `- ${order.complement}` : ""} <br />
                  {order.neighborhood} - {order.city} / {order.state} <br />
                  CEP: {order.zipCode.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                </span>
              </div>

              {order.notes && (
                <div className="border-t border-gray-50 pt-2.5">
                  <span className="font-bold text-gray-800 block text-[9px] uppercase tracking-wide">Observações:</span>
                  <p className="text-[9px] text-gray-400 font-semibold leading-relaxed mt-0.5">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-primary" />
              Pagamento
            </h3>

            <div className="border border-gray-100 rounded-2xl p-4 shadow-3xs flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-gray-800 block">Forma de pagamento</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mt-0.5">
                  {order.paymentMethod === "credit_card" 
                    ? "Cartão de Crédito" 
                    : order.paymentMethod === "pix" 
                    ? "Pix" 
                    : order.paymentMethod === "boleto"
                    ? "Boleto Bancário"
                    : "Faturado / À Combinar"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
