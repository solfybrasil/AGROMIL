"use client";

import { useEffect, useState } from "react";
import { ClipboardList, ArrowRight, Eye, Calendar, DollarSign, Package } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  paymentMethod: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/customer/orders");
        if (res.ok) {
          const data = await res.json();
          // Sort by date desc
          setOrders(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (err) {
        console.error("Failed to fetch customer orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"].includes(order.status);
    if (filter === "DELIVERED") return order.status === "DELIVERED";
    if (filter === "CANCELLED") return order.status === "CANCELLED";
    return true;
  });

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
    <div className="space-y-6 font-sans text-xs">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Meus Pedidos
          </h1>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Consulte e acompanhe suas compras na Agromil.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
          {["ALL", "ACTIVE", "DELIVERED", "CANCELLED"].map((t) => {
            const label = t === "ALL" ? "Todos" : t === "ACTIVE" ? "Em Aberto" : t === "DELIVERED" ? "Entregues" : "Cancelados";
            const isActive = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive ? "bg-white text-gray-800 shadow-3xs" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs hover:border-gray-200 transition-all"
            >
              
              {/* Order Info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block">Número do Pedido</span>
                  <span className="font-serif font-black text-gray-800 text-sm">#{order.id.substring(order.id.length - 8).toUpperCase()}</span>
                </div>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-3 gap-6 text-[10px] sm:min-w-[320px]">
                <div className="space-y-0.5">
                  <span className="text-gray-400 font-bold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Data
                  </span>
                  <span className="text-gray-700 font-black">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gray-400 font-bold flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Total
                  </span>
                  <span className="text-gray-700 font-black">R$ {Number(order.total).toFixed(2)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gray-400 font-bold block">Status</span>
                  <span>{getStatusBadge(order.status)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 sm:pt-0">
                <Link
                  href={`/minha-conta/pedidos/${order.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-primary hover:text-white transition-all text-gray-600 font-black text-[9px] px-4 py-2.5 rounded-xl uppercase tracking-wider"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ver Detalhes</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-250 rounded-2xl p-12 text-center space-y-3.5">
          <Package className="h-10 w-10 text-gray-300 mx-auto" />
          <div>
            <h4 className="font-bold text-gray-800">Nenhum pedido encontrado</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Você não possui pedidos na categoria selecionada.</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-primary text-white font-bold text-[10px] px-4 py-2 rounded-xl"
          >
            <span>Fazer Compras</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

    </div>
  );
}
