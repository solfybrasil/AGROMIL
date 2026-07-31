"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClipboardList, Search, Eye, ArrowRight, ArrowLeft, DollarSign,
  Calendar, AlertCircle, Truck, Sparkles, Phone, MapPin, Volume2,
  VolumeX, Bell, MessageSquare, CreditCard, Landmark, Zap, StickyNote,
  Package, Clock, CheckCircle2, TrendingUp, Activity, ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { dbService } from "@/lib/db-service";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName?: string;
  product?: {
    name: string;
    unit?: string;
  } | null;
}

interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  status: "NEW" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: OrderItem[];
}

const COLUMNS: Array<{
  status: Order["status"];
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
  borderColor: string;
  icon: any;
}> = [
  { status: "NEW", label: "Novos", bgColor: "bg-blue-50/70", textColor: "text-blue-700", dotColor: "bg-blue-500", borderColor: "border-blue-200", icon: Bell },
  { status: "CONFIRMED", label: "Confirmados", bgColor: "bg-indigo-50/70", textColor: "text-indigo-700", dotColor: "bg-indigo-500", borderColor: "border-indigo-200", icon: CheckCircle2 },
  { status: "PREPARING", label: "Preparando", bgColor: "bg-amber-50/70", textColor: "text-amber-700", dotColor: "bg-amber-500", borderColor: "border-amber-200", icon: Clock },
  { status: "SHIPPED", label: "A Caminho", bgColor: "bg-purple-50/70", textColor: "text-purple-700", dotColor: "bg-purple-500", borderColor: "border-purple-200", icon: Truck },
  { status: "DELIVERED", label: "Entregues", bgColor: "bg-emerald-50/70", textColor: "text-emerald-700", dotColor: "bg-emerald-500", borderColor: "border-emerald-200", icon: Package },
  { status: "CANCELLED", label: "Cancelados", bgColor: "bg-rose-50/70", textColor: "text-rose-700", dotColor: "bg-rose-500", borderColor: "border-rose-200", icon: AlertCircle },
];

const STATUS_ORDER: Order["status"][] = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

function playAlertBeep(audioCtx: AudioContext) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);
  gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

export default function AdminOrdersKanban() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [mobileColIdx, setMobileColIdx] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = async () => {
    try {
      const localOrders = await dbService.getOrders();
      if (localOrders && localOrders.length > 0) {
        setOrders(localOrders as any);
        setNewOrderCount(localOrders.filter((o: any) => o.status === "NEW").length);
        setLoading(false);
      }

      const res = await fetch("/api/pedidos");
      if (res.ok) {
        const data: Order[] = await res.json();
        const currentIds = new Set(data.map((o) => o.id));
        const brandNewOrders = data.filter(
          (o) => o.status === "NEW" && !prevOrderIdsRef.current.has(o.id)
        );
        if (brandNewOrders.length > 0 && prevOrderIdsRef.current.size > 0) {
          document.title = `🔔 ${brandNewOrders.length} NOVO(S) PEDIDO(S) - Agromil Admin`;
          setTimeout(() => { document.title = "Pedidos | Agromil Admin"; }, 5000);
        }
        prevOrderIdsRef.current = currentIds;
        setOrders(data);
        const newCount = data.filter((o) => o.status === "NEW").length;
        setNewOrderCount(newCount);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const startAlarm = () => {
    if (alarmIntervalRef.current) return;
    alarmIntervalRef.current = setInterval(() => {
      if (!muted && hasInteracted && audioCtxRef.current) {
        try { playAlertBeep(audioCtxRef.current); } catch {}
      }
    }, 8000);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) { clearInterval(alarmIntervalRef.current); alarmIntervalRef.current = null; }
  };

  const initAudio = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  useEffect(() => {
    fetchOrders();
    pollIntervalRef.current = setInterval(fetchOrders, 8000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (newOrderCount > 0 && !muted && hasInteracted) {
      startAlarm();
      if (audioCtxRef.current) {
        try { playAlertBeep(audioCtxRef.current); } catch {}
      }
    } else {
      stopAlarm();
    }
  }, [newOrderCount, muted, hasInteracted]);

  const moveOrder = async (orderId: string, nextStatus: Order["status"]) => {
    setUpdatingId(orderId);
    try {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
      await fetch(`/api/pedidos/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPhone = (phone: string) => phone.replace(/\D/g, "");

  const paymentConfig = (method: string) => {
    const m = (method || "").toLowerCase();
    if (m.includes("pix")) return { label: "PIX", icon: <Zap className="h-3 w-3 text-emerald-600" /> };
    if (m.includes("cart") || m.includes("cred")) return { label: "Cartão de Crédito", icon: <CreditCard className="h-3 w-3 text-purple-600" /> };
    if (m.includes("boleto")) return { label: "Boleto", icon: <Landmark className="h-3 w-3 text-amber-600" /> };
    return { label: method || "Dinheiro", icon: <DollarSign className="h-3 w-3 text-gray-500" /> };
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.clientName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.clientPhone.includes(q)
    );
  });

  const renderOrderCard = (ord: Order) => {
    const currentIdx = STATUS_ORDER.indexOf(ord.status);
    const prevStatus = currentIdx > 0 ? STATUS_ORDER[currentIdx - 1] : null;
    const nextStatus = currentIdx >= 0 && currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null;
    const payInfo = paymentConfig(ord.paymentMethod);
    const isExpanded = expandedCard === ord.id;
    const isNew = ord.status === "NEW";

    return (
      <div
        key={ord.id}
        onClick={initAudio}
        className={`bg-white border rounded-2xl p-3.5 shadow-xs space-y-2.5 transition-all relative group ${
          isNew ? "border-blue-300 ring-2 ring-blue-500/20 bg-blue-50/10" : "border-[#EDE3D3] hover:border-[#8B5E3C]/40"
        }`}
      >
        {isNew && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
            Novo
          </div>
        )}

        {/* ID & Date */}
        <div className="flex items-center justify-between text-[9px] font-bold text-[#7A6F63] uppercase tracking-wider">
          <span className="text-[#8B5E3C] font-black">#{ord.id.slice(-8).toUpperCase()}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(ord.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Client */}
        <div className="space-y-1">
          <h4 className="text-xs font-black text-[#2B2620] truncate">{ord.clientName}</h4>
          <a
            href={`https://wa.me/55${formatPhone(ord.clientPhone)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors w-fit uppercase"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3 w-3 text-emerald-600" />
            <span>{ord.clientPhone}</span>
          </a>
          <div className="flex items-start gap-1 text-[9px] text-[#7A6F63] font-medium">
            <MapPin className="h-3 w-3 text-[#8B5E3C] flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {ord.street}, {ord.number}{ord.complement ? ` - ${ord.complement}` : ""} — {ord.neighborhood}
            </span>
          </div>
        </div>

        {/* Payment */}
        <div className="flex items-center gap-1.5 bg-[#F5EFE6] border border-[#EDE3D3] rounded-xl px-2.5 py-1">
          {payInfo.icon}
          <span className="text-[9px] font-black text-[#2B2620] uppercase tracking-wider">{payInfo.label}</span>
        </div>

        {/* Items */}
        <div className="bg-[#F5EFE6]/40 rounded-xl border border-[#EDE3D3] overflow-hidden">
          <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-[#EDE3D3]">
            <Package className="h-3 w-3 text-[#8B5E3C]" />
            <span className="text-[9px] font-black text-[#2B2620] uppercase tracking-wider">
              {ord.items.length} ite{ord.items.length > 1 ? "ns" : "m"}
            </span>
            {ord.items.length > 2 && (
              <button onClick={() => setExpandedCard(isExpanded ? null : ord.id)}
                className="ml-auto text-[8px] font-black text-[#8B5E3C] hover:underline uppercase flex items-center gap-0.5">
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
          <div className="divide-y divide-[#EDE3D3]/50">
            {(isExpanded ? ord.items : ord.items.slice(0, 2)).map((item, idx) => (
              <div key={item.id || idx} className="text-[9px] text-[#2B2620] font-semibold flex items-center justify-between px-2.5 py-1">
                <span className="truncate mr-2 font-bold">{item.productName || item.product?.name || "Produto"}</span>
                <span className="flex-shrink-0 font-black text-[#8B5E3C] bg-[#8B5E3C]/10 px-1.5 py-0.5 rounded text-[8px]">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EDE3D3]">
          <div>
            <span className="text-[8px] text-[#7A6F63] font-black uppercase tracking-wider block">Total</span>
            <span className="text-sm font-black text-[#8B5E3C]">
              R$ {Number(ord.total).toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {prevStatus && (
              <button
                onClick={() => moveOrder(ord.id, prevStatus)}
                disabled={updatingId === ord.id}
                className="p-1.5 rounded-xl border border-[#EDE3D3] hover:bg-[#F5EFE6] text-gray-500 hover:text-[#2B2620] transition-colors cursor-pointer"
                title="Voltar status"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            )}
            {nextStatus && (
              <button
                onClick={() => moveOrder(ord.id, nextStatus)}
                disabled={updatingId === ord.id}
                className="flex items-center gap-1 bg-[#8B5E3C] hover:bg-[#6d482d] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            {ord.status === "NEW" && (
              <button
                onClick={() => moveOrder(ord.id, "CANCELLED")}
                disabled={updatingId === ord.id}
                className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                title="Cancelar pedido"
              >
                <AlertCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans text-[#2B2620] animate-fade-in-up">

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 text-[#8B5E3C]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
              Controle Operacional
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2620] tracking-tight mt-0.5">
              Gestão de Pedidos (Kanban)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMuted(!muted)}
            className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-2xl border transition-all cursor-pointer ${
              muted ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{muted ? "Alerta Mudo" : "Som Ativo"}</span>
          </button>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6F63]" />
            <input
              type="text" placeholder="Buscar pedido ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-[#F5EFE6]/50 border border-[#EDE3D3] rounded-2xl pl-10 py-2.5 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Mobile Column Picker */}
      <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {COLUMNS.map((col, i) => (
          <button
            key={col.status}
            onClick={() => setMobileColIdx(i)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer ${
              mobileColIdx === i
                ? "bg-[#8B5E3C] text-white shadow-sm"
                : "bg-white text-gray-600 border border-[#EDE3D3]"
            }`}
          >
            <span>{col.label}</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[9px]">
              {filteredOrders.filter((o) => o.status === col.status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#7A6F63] text-xs font-semibold animate-pulse">
          Carregando pedidos...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start">
          {COLUMNS.map((col, idx) => {
            const colOrders = filteredOrders.filter((o) => o.status === col.status);
            const isHiddenMobile = mobileColIdx !== idx;

            return (
              <div
                key={col.status}
                className={`space-y-3 bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-3xl p-3.5 ${
                  isHiddenMobile ? "hidden lg:block" : "block"
                }`}
              >
                {/* Column Header */}
                <div className={`p-3 rounded-2xl border ${col.bgColor} ${col.borderColor} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <span className={`text-xs font-black uppercase tracking-wider ${col.textColor}`}>{col.label}</span>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-white ${col.textColor}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 min-h-[300px]">
                  {colOrders.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-[10px] font-semibold border-2 border-dashed border-[#EDE3D3] rounded-2xl">
                      Nenhum pedido
                    </div>
                  ) : (
                    colOrders.map(renderOrderCard)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
