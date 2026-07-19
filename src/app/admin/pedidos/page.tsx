"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClipboardList,
  Search,
  Eye,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  AlertCircle,
  Truck,
  Sparkles,
  Phone,
  MapPin,
  Volume2,
  VolumeX,
  Bell,
  MessageSquare,
  CreditCard,
  Landmark,
  Zap,
  StickyNote,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

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
  { status: "NEW", label: "Novos", bgColor: "bg-blue-50/50", textColor: "text-blue-700", dotColor: "bg-blue-500", borderColor: "border-blue-200", icon: Bell },
  { status: "CONFIRMED", label: "Confirmados", bgColor: "bg-indigo-50/50", textColor: "text-indigo-700", dotColor: "bg-indigo-500", borderColor: "border-indigo-200", icon: CheckCircle2 },
  { status: "PREPARING", label: "Preparando", bgColor: "bg-amber-50/50", textColor: "text-amber-700", dotColor: "bg-amber-500", borderColor: "border-amber-200", icon: Clock },
  { status: "SHIPPED", label: "A Caminho", bgColor: "bg-purple-50/50", textColor: "text-purple-700", dotColor: "bg-purple-500", borderColor: "border-purple-200", icon: Truck },
  { status: "DELIVERED", label: "Entregues", bgColor: "bg-emerald-50/50", textColor: "text-emerald-700", dotColor: "bg-emerald-500", borderColor: "border-emerald-200", icon: Package },
  { status: "CANCELLED", label: "Cancelados", bgColor: "bg-rose-50/50", textColor: "text-rose-700", dotColor: "bg-rose-500", borderColor: "border-rose-200", icon: AlertCircle },
];

const STATUS_ORDER: Order["status"][] = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

// Generates an 880 Hz beep using Web Audio API
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
  // Mobile: which column tab is selected
  const [mobileColIdx, setMobileColIdx] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = async () => {
    try {
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
    } catch (err) {
      console.warn("Orders API offline. Local state fallback.", err);
    } finally {
      setLoading(false);
    }
  };

  const startAlarm = () => {
    if (alarmIntervalRef.current) return;
    alarmIntervalRef.current = setInterval(() => {
      if (!muted && hasInteracted && audioCtxRef.current) {
        try { playAlertBeep(audioCtxRef.current); } catch (e) { console.warn("Audio playback failed:", e); }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (newOrderCount > 0 && !muted && hasInteracted) {
      startAlarm();
      if (audioCtxRef.current) {
        try { playAlertBeep(audioCtxRef.current); } catch(e) {}
      }
    } else {
      stopAlarm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrderCount, muted, hasInteracted]);

  const moveOrder = async (orderId: string, nextStatus: Order["status"]) => {
    setUpdatingId(orderId);
    try {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
      const res = await fetch(`/api/pedidos/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) fetchOrders();
    } catch (err) {
      console.error("Failed to update status", err);
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (current: Order["status"]): Order["status"] | null => {
    const idx = STATUS_ORDER.indexOf(current);
    if (idx === -1 || idx === STATUS_ORDER.length - 1) return null;
    return STATUS_ORDER[idx + 1];
  };

  const getPrevStatus = (current: Order["status"]): Order["status"] | null => {
    const idx = STATUS_ORDER.indexOf(current);
    if (idx === -1 || idx === 0) return null;
    return STATUS_ORDER[idx - 1];
  };

  const getPaymentInfo = (method: string) => {
    switch (method) {
      case "pix": return { label: "Pix", icon: <Zap className="h-3 w-3 text-teal-500" /> };
      case "card_on_delivery": return { label: "Cartão", icon: <CreditCard className="h-3 w-3 text-blue-500" /> };
      case "money": return { label: "Dinheiro", icon: <Landmark className="h-3 w-3 text-emerald-500" /> };
      default: return { label: method, icon: <DollarSign className="h-3 w-3 text-gray-400" /> };
    }
  };

  const formatPhone = (phone: string) => phone.replace(/\D/g, "");

  const filteredOrders = orders.filter((ord) => {
    const term = search.toLowerCase();
    return (
      ord.clientName.toLowerCase().includes(term) ||
      ord.id.toLowerCase().includes(term) ||
      ord.neighborhood.toLowerCase().includes(term) ||
      (ord.clientPhone || "").includes(term)
    );
  });

  const activeOrdersCount = orders.filter((o) => ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"].includes(o.status)).length;
  const inProgressRevenue = orders
    .filter((o) => ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);

  // ── Order Card component (shared between mobile & desktop) ─────────
  const OrderCard = ({ ord }: { ord: Order }) => {
    const next = getNextStatus(ord.status);
    const prev = getPrevStatus(ord.status);
    const isUpdating = updatingId === ord.id;
    const payInfo = getPaymentInfo(ord.paymentMethod);
    const isExpanded = expandedCard === ord.id;
    const isNew = ord.status === "NEW";

    return (
      <div
        className={`bg-white rounded-xl md:rounded-2xl border p-3 md:p-4 shadow-xs transition-all flex flex-col gap-2.5 md:gap-3.5 relative overflow-hidden
          ${isUpdating ? "opacity-60 scale-[0.98] pointer-events-none" : ""}
          ${isNew ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-100"}`}
      >
        {isNew && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-[7px] font-black px-2 py-0.5 rounded-bl-xl uppercase tracking-widest animate-pulse">
            Novo
          </div>
        )}

        {/* ID & Date */}
        <div className="flex items-center justify-between text-[8px] font-bold text-gray-400 pr-6 uppercase tracking-wider">
          <span className="text-primary font-black">#{ord.id.slice(-8).toUpperCase()}</span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="h-2.5 w-2.5" />
            {new Date(ord.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Client */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] md:text-xs font-black text-gray-800 truncate">{ord.clientName}</h4>
          <a
            href={`https://wa.me/55${formatPhone(ord.clientPhone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[8px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2 py-1 rounded-lg transition-colors w-fit uppercase"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-2.5 w-2.5" />
            <span>{ord.clientPhone}</span>
          </a>
          <div className="flex items-start gap-1 text-[8px] text-gray-400 font-bold">
            <MapPin className="h-3 w-3 text-gray-300 flex-shrink-0 mt-0.5" />
            <span className="leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {ord.street}, {ord.number}{ord.complement ? ` - ${ord.complement}` : ""} — {ord.neighborhood}
            </span>
          </div>
        </div>

        {/* Payment */}
        <div className="flex items-center gap-1.5 bg-gray-50/80 border border-gray-100 rounded-lg px-2 py-1">
          {payInfo.icon}
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider">{payInfo.label}</span>
        </div>

        {/* Notes */}
        {ord.notes && (
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg px-2.5 py-1.5 flex items-start gap-1">
            <StickyNote className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[8px] font-semibold text-amber-800 leading-snug italic">"{ord.notes}"</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-gray-50/30 rounded-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100">
            <Package className="h-3 w-3 text-primary" />
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider">
              {ord.items.length} ite{ord.items.length > 1 ? "ns" : "m"}
            </span>
            {ord.items.length > 2 && (
              <button
                onClick={() => setExpandedCard(isExpanded ? null : ord.id)}
                className="ml-auto text-[7px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
              >
                {isExpanded ? <><ChevronUp className="h-2.5 w-2.5" />menos</> : <><ChevronDown className="h-2.5 w-2.5" />todos</>}
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {(isExpanded ? ord.items : ord.items.slice(0, 2)).map((item, idx) => (
              <div key={item.id || idx} className="text-[9px] text-gray-600 font-semibold flex items-center justify-between px-2 py-1">
                <span className="truncate mr-2 font-bold">{item.productName || item.product?.name || "Produto"}</span>
                <span className="flex-shrink-0 font-black text-primary bg-primary-light px-1.5 py-0.5 rounded text-[7px]">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <div className="text-[7px] text-gray-400 font-black uppercase tracking-wider">Total</div>
            <div className="text-[13px] md:text-sm font-black text-[#1b4332]">
              R$ {Number(ord.total).toFixed(2).replace(".", ",")}
            </div>
            {Number(ord.deliveryFee) === 0 && (
              <div className="text-[7px] text-emerald-600 font-black uppercase tracking-wider">✓ Frete grátis</div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {prev && (
              <button onClick={() => moveOrder(ord.id, prev)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Voltar Status">
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            )}
            <Link href={`/admin/pedidos/${ord.id}`} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors" title="Ver Detalhes">
              <Eye className="h-3.5 w-3.5" />
            </Link>
            {next && (
              <button onClick={() => moveOrder(ord.id, next)} className="p-1.5 rounded-lg bg-primary hover:bg-[#122e22] text-white transition-colors cursor-pointer flex items-center gap-1 font-black text-[8px] px-2.5 shadow-xs uppercase tracking-wider" title="Avançar Status">
                <CheckCircle2 className="h-3 w-3" />
                <span className="hidden sm:inline">Avançar</span>
              </button>
            )}
            {!next && ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (
              <button onClick={() => moveOrder(ord.id, "CANCELLED")} className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer" title="Cancelar">
                <AlertCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in-up" onClick={initAudio} onKeyDown={initAudio}>

      {/* ── Header ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-lg md:text-2xl font-extrabold text-[#1b4332]">Painel de Pedidos</h1>
            {newOrderCount > 0 && (
              <span className="text-[8px] bg-rose-500 text-white px-2.5 py-1 rounded-full font-black uppercase flex items-center gap-1 animate-pulse shadow-sm">
                <Bell className="h-3 w-3" />
                {newOrderCount} novo{newOrderCount > 1 ? "s" : ""}!
              </span>
            )}
          </div>
          <p className="text-[9px] md:text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary animate-spin" style={{ animationDuration: "5s" }} />
            Atualização em tempo real (8s)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={(e) => { e.stopPropagation(); initAudio(); setMuted((m) => !m); }}
            className={`flex items-center gap-1.5 text-[9px] md:text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-xs
              ${muted ? "bg-rose-50 border-rose-200 text-rose-600" : newOrderCount > 0 ? "bg-primary text-white border-primary animate-pulse" : "bg-white border-gray-200 text-gray-600"}`}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{muted ? "Mudo" : "Som Ativo"}</span>
          </button>

          <div className="relative flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Filtrar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[140px] sm:w-[180px] md:w-[220px] bg-white border border-gray-200 rounded-xl pl-9 py-2 pr-3 text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-all placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-5">
        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-5 shadow-xs flex items-center gap-2.5 md:gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl md:rounded-2xl p-2 md:p-3 flex-shrink-0">
            <TrendingUp className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Em Trânsito</span>
            <span className="text-[11px] md:text-xl font-black text-gray-800 tracking-tight mt-0.5 block leading-tight">
              R$ {inProgressRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-5 shadow-xs flex items-center gap-2.5 md:gap-4">
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl md:rounded-2xl p-2 md:p-3 flex-shrink-0">
            <Package className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Em Andamento</span>
            <span className="text-[11px] md:text-xl font-black text-gray-800 tracking-tight mt-0.5 block leading-tight">{activeOrdersCount} ativos</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-5 shadow-xs flex items-center gap-2.5 md:gap-4">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl md:rounded-2xl p-2 md:p-3 flex-shrink-0">
            <Activity className="h-3.5 w-3.5 md:h-5 md:w-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Novos</span>
            <span className="text-[11px] md:text-xl font-black text-gray-800 tracking-tight mt-0.5 block leading-tight">
              {newOrderCount > 0 ? `${newOrderCount} aguardando` : "Nenhum"}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          <span className="text-[10px] font-semibold animate-pulse">Carregando pedidos...</span>
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════
              MOBILE: Tab switcher + single column
          ══════════════════════════════════════ */}
          <div className="md:hidden space-y-3">
            {/* Column Selector Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {COLUMNS.map((col, idx) => {
                const count = filteredOrders.filter(o => o.status === col.status).length;
                const isActive = mobileColIdx === idx;
                const IconComponent = col.icon;
                return (
                  <button
                    key={col.status}
                    onClick={() => setMobileColIdx(idx)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all active:scale-95
                      ${isActive
                        ? `${col.bgColor} ${col.borderColor} ${col.textColor} shadow-xs`
                        : "bg-white border-gray-100 text-gray-400"}`}
                  >
                    <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{col.label}</span>
                    {count > 0 && (
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${isActive ? `${col.textColor} bg-white/70` : "bg-gray-100 text-gray-500"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active column cards */}
            {(() => {
              const col = COLUMNS[mobileColIdx];
              const colOrders = filteredOrders.filter(o => o.status === col.status);
              return (
                <div className="space-y-3">
                  {colOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-300 gap-2 bg-white rounded-2xl border border-gray-100">
                      <ClipboardList className="h-8 w-8 opacity-30" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Nenhum pedido aqui</span>
                    </div>
                  ) : (
                    colOrders.map(ord => <OrderCard key={ord.id} ord={ord} />)
                  )}
                </div>
              );
            })()}
          </div>

          {/* ══════════════════════════════════════
              DESKTOP: Horizontal Kanban Board
          ══════════════════════════════════════ */}
          <div className="hidden md:flex gap-5 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200">
            {COLUMNS.map((col) => {
              const columnOrders = filteredOrders.filter((o) => o.status === col.status);
              const isNewCol = col.status === "NEW";
              const IconComponent = col.icon;

              return (
                <div
                  key={col.status}
                  className={`w-[290px] xl:w-[310px] flex-shrink-0 rounded-3xl p-4 flex flex-col max-h-[75vh] border shadow-xs
                    ${isNewCol && newOrderCount > 0 ? "bg-blue-50/60 border-blue-200" : `${col.bgColor} ${col.borderColor}`}`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-gray-200/60">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dotColor} ${isNewCol && newOrderCount > 0 ? "animate-ping" : ""}`} />
                      <div className="flex items-center gap-1">
                        <IconComponent className="h-4.5 w-4.5 text-gray-500" />
                        <h3 className="text-[10px] font-black text-gray-700 uppercase tracking-wider">{col.label}</h3>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${col.bgColor} ${col.textColor} border ${col.borderColor}`}>
                      {columnOrders.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px] scrollbar-thin scrollbar-thumb-black/5">
                    {columnOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-300 gap-1.5">
                        <ClipboardList className="h-7 w-7 opacity-30" />
                        <span className="text-[8px] font-black uppercase tracking-wider">Vazio</span>
                      </div>
                    ) : (
                      columnOrders.map((ord) => <OrderCard key={ord.id} ord={ord} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
