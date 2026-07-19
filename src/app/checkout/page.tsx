"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import CartDrawer from "@/components/CartDrawer";
import { useCartStore } from "@/lib/cart-store";
import {
  ArrowLeft, CheckCircle, CreditCard, ShoppingBag, Landmark, Zap,
  Loader, Tag, X, MapPin, Truck, Clock, ChevronDown, ChevronUp,
  Package, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Form State
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Itu");
  const [state, setState] = useState("SP");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  // Prevents the "empty cart → /carrinho" redirect from firing after order is placed
  const orderPlaced = useRef(false);

  // CEP / Frete
  const [cepLoading, setCepLoading] = useState(false);
  const [cepInfo, setCepInfo] = useState<any>(null);
  const [cepError, setCepError] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(15);
  const [deliveryZone, setDeliveryZone] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");

  // Coupon
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  // Active order block
  const [activeOrder, setActiveOrder] = useState<{ id: string; displayId: string; status: string } | null>(null);

  // Auth
  useEffect(() => {
    setMounted(true);
    const checkCustomerSession = async () => {
      try {
        const res = await fetch("/api/customer/me");
        if (res.ok) {
          const data = await res.json();
        if (data.session) {
            const cust = data.session;
            setCustomerId(cust.id);
            setName(cust.name || "");
            setPhone(cust.phone || "");
            setEmail(cust.email || "");
            const cep = cust.zipCode || "";
            setZipCode(cep);
            setStreet(cust.street || "");
            setNumber(cust.number || "");
            setComplement(cust.complement || "");
            setNeighborhood(cust.neighborhood || "");
            setCity(cust.city || "Itu");
            setState(cust.state || "SP");

            // Check for active order — block checkout if one exists
            const activeRes = await fetch("/api/pedidos/ativos");
            if (activeRes.ok) {
              const activeData = await activeRes.json();
              if (activeData.order) {
                setActiveOrder(activeData.order);
              }
            }
          } else {
            router.push("/login?redirect=/checkout");
            return;
          }
        } else {
          router.push("/login?redirect=/checkout");
          return;
        }
      } catch {
        router.push("/login?redirect=/checkout");
        return;
      } finally {
        setAuthLoading(false);
      }
    };
    checkCustomerSession();
  }, [router]);

  useEffect(() => {
    if (mounted && !authLoading && items.length === 0 && !orderPlaced.current) {
      router.push("/carrinho");
    }
  }, [mounted, authLoading, items, router]);

  // CEP lookup
  const lookupCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    setCepError("");
    try {
      const subtotal = getCartTotal();
      const res = await fetch(`/api/frete?cep=${clean}&subtotal=${subtotal}`);
      const data = await res.json();
      if (!res.ok) { setCepError(data.error || "CEP inválido"); return; }
      setCepInfo(data);
      setDeliveryFee(data.fee);
      setDeliveryZone(data.zone);
      setDeliveryDays(data.estimatedDays);
      // Auto-fill address from ViaCEP
      if (data.address?.street) setStreet(data.address.street);
      if (data.address?.neighborhood) setNeighborhood(data.address.neighborhood);
      if (data.address?.city) setCity(data.address.city);
      if (data.address?.state) setState(data.address.state);
    } catch {
      setCepError("Erro ao consultar CEP");
    } finally {
      setCepLoading(false);
    }
  }, [getCartTotal]);

  // Auto-lookup when zipCode changes to 8 digits
  useEffect(() => {
    const clean = zipCode.replace(/\D/g, "");
    if (clean.length === 8) lookupCep(clean);
  }, [zipCode, lookupCep]);

  // Coupon validation
  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponData(null);
    try {
      const res = await fetch("/api/cupom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), subtotal: getCartTotal() }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponData(data);
        setCouponCode(couponInput.trim().toUpperCase());
        setCouponError("");
      } else {
        setCouponError(data.message || "Cupom inválido");
      }
    } catch {
      setCouponError("Erro ao validar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponData(null);
    setCouponCode("");
    setCouponInput("");
    setCouponError("");
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center py-20 select-none">
        <Loader className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-gray-500 mt-4 animate-pulse">Carregando checkout seguro...</span>
      </div>
    );
  }

  // ── Pedido ativo: bloquear novo pedido (estilo iFood) ─────────
  if (activeOrder) {
    const STATUS_LABELS: Record<string, string> = {
      NEW:              "🕐 Aguardando confirmação",
      CONFIRMED:        "✅ Confirmado pela loja",
      PREPARING:        "📦 Em preparação",
      OUT_FOR_DELIVERY: "🚚 Saiu para entrega",
      READY_FOR_PICKUP: "🏪 Pronto para retirada",
    };
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col">
        <Header />
        <CategoryMenu />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
            {/* Top bar */}
            <div className="bg-[#1b4332] px-6 py-5 flex items-center gap-4">
              <div className="bg-emerald-400/20 p-3 rounded-2xl">
                <Package className="h-7 w-7 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Pedido em Andamento</p>
                <p className="text-white font-extrabold text-lg leading-tight">#{activeOrder.displayId}</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-extrabold text-amber-800">Você já tem um pedido ativo</p>
                  <p className="text-xs text-amber-700 font-semibold mt-1 leading-relaxed">
                    Assim como no iFood, só é possível ter <strong>um pedido por vez</strong>.
                    Aguarde a entrega do pedido atual para fazer um novo.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Status Atual</p>
                  <p className="text-sm font-extrabold text-[#1b4332] mt-0.5">
                    {STATUS_LABELS[activeOrder.status] ?? activeOrder.status}
                  </p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <Link
                href={`/pedidos/${activeOrder.id}`}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#122e22] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-sm transition-all"
              >
                <Package className="h-4 w-4" />
                Acompanhar Meu Pedido
              </Link>

              <Link
                href="/"
                className="w-full flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs py-3 rounded-2xl transition-all"
              >
                Voltar para a Loja
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  // ───────────────────────────────────────────────────────────────

  if (items.length === 0) return null;

  const subtotal = getCartTotal();
  const couponDiscount = couponData
    ? couponData.type === "percent"
      ? (subtotal * couponData.value) / 100
      : couponData.value
    : 0;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const outOfStockItem = items.find(item => item.product.stock <= 0);
    if (outOfStockItem) {
      alert(`O produto "${outOfStockItem.product.name}" está temporariamente sem estoque.`);
      return;
    }

    setSubmitting(true);

    const orderData = {
      clientName: name,
      clientPhone: phone,
      clientEmail: email || null,
      street,
      number,
      complement: complement || null,
      neighborhood,
      city,
      state,
      zipCode,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
      notes: notes || null,
      customerId,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.promoPrice !== null && item.product.promoPrice !== undefined
          ? Number(item.product.promoPrice)
          : Number(item.product.price),
        productName: item.product.name,
      })),
    };

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        orderPlaced.current = true; // bloqueia o redirect do useEffect de carrinho vazio
        clearCart();
        // Redireciona direto para a linha do tempo do pedido recém-criado
        router.push(`/pedidos/${data.id}?novo=1`);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        setSubmitting(false);
        if (res.status === 409 && errData.code === "ACTIVE_ORDER_EXISTS") {
          alert(errData.error);
          setActiveOrder({
            id: errData.activeOrderId,
            displayId: errData.activeOrderId.slice(-6).toUpperCase(),
            status: "NEW",
          });
        } else {
          alert(`Erro ao registrar pedido: ${errData.error || "Tente novamente."}`);
        }
        return;
      }
    } catch {
      setSubmitting(false);
      alert("Erro de conexão com o servidor. Verifique sua internet e tente novamente.");
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-gray-300";
  const labelClass = "block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
      <Header />
      <CategoryMenu />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 select-none">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/carrinho" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-serif text-2xl font-extrabold text-[#1b4332]">Finalizar Pedido</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ─── LEFT: Form ─── */}
          <div className="lg:col-span-3 space-y-5">

            {/* 1. Contato */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-widest flex items-center gap-2">
                <span className="rounded-full bg-primary text-white h-5 w-5 flex items-center justify-center text-[10px] font-black">1</span>
                Dados de Contato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className={labelClass}>Nome Completo *</label>
                  <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>WhatsApp *</label>
                  <input type="tel" id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className={labelClass}>E-mail (opcional)</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" className={inputClass} />
                </div>
              </div>
            </div>

            {/* 2. Endereço + CEP automático */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-widest flex items-center gap-2">
                <span className="rounded-full bg-primary text-white h-5 w-5 flex items-center justify-center text-[10px] font-black">2</span>
                Endereço de Entrega
              </h3>

              {/* CEP field with auto-lookup */}
              <div>
                <label htmlFor="zip" className={labelClass}>CEP *</label>
                <div className="relative">
                  <input
                    type="text"
                    id="zip"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className={`${inputClass} pr-10`}
                  />
                  {cepLoading && (
                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary animate-spin" />
                  )}
                  {!cepLoading && cepInfo && (
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />
                  )}
                </div>
                {/* CEP result banner */}
                {cepInfo && !cepError && (
                  <div className={`mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-xl ${cepInfo.isFree ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                    <Truck className="h-3 w-3 flex-shrink-0" />
                    <span>{cepInfo.message}</span>
                    {cepInfo.distanceKm !== null && cepInfo.distanceKm !== undefined && (
                      <span className="text-gray-400 font-semibold">· {cepInfo.distanceKm} km da loja</span>
                    )}
                    {!cepInfo.isFree && cepInfo.remainingForFree > 0 && (
                      <span className="ml-auto text-gray-400 font-semibold">
                        Faltam R$ {cepInfo.remainingForFree.toFixed(2)} para frete grátis
                      </span>
                    )}
                  </div>
                )}
                {cepError && <p className="mt-1.5 text-[10px] font-bold text-rose-600">{cepError}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="street" className={labelClass}>Rua / Avenida *</label>
                  <input type="text" id="street" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua da agropecuária" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="number" className={labelClass}>Número *</label>
                  <input type="text" id="number" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="comp" className={labelClass}>Complemento</label>
                  <input type="text" id="comp" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." className={inputClass} />
                </div>
                <div>
                  <label htmlFor="neighborhood" className={labelClass}>Bairro *</label>
                  <input type="text" id="neighborhood" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Rancho Grande" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="city" className={labelClass}>Cidade</label>
                  <input type="text" id="city" value={city} className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} disabled />
                </div>
              </div>
            </div>

            {/* 3. Pagamento */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-widest flex items-center gap-2">
                <span className="rounded-full bg-primary text-white h-5 w-5 flex items-center justify-center text-[10px] font-black">3</span>
                Forma de Pagamento
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "pix",   label: "Pix",             Icon: Zap },
                  { value: "card",  label: "Cartão",          Icon: CreditCard },
                  { value: "money", label: "Dinheiro",        Icon: Landmark },
                ].map(({ value, label, Icon }) => (
                  <label key={value} className={`border rounded-2xl p-3.5 flex flex-col items-center gap-2 cursor-pointer transition-all ${paymentMethod === value ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                    <Icon className={`h-5 w-5 ${paymentMethod === value ? "text-primary" : "text-gray-400"}`} />
                    <span className={`text-[10px] font-bold ${paymentMethod === value ? "text-primary" : "text-gray-500"}`}>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>Observações</label>
                <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Troco para R$ 100, instrução de entrega..." className={inputClass} />
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Summary ─── */}
          <div className="lg:col-span-2 space-y-4 sticky top-6">

            {/* Items */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs">
              <h3 className="font-serif text-base font-bold text-[#1b4332] border-b border-gray-100 pb-3 mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Revisão ({items.length} {items.length === 1 ? "item" : "itens"})
              </h3>
              <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                {items.map((item) => {
                  const hasPromo = item.product.promoPrice !== null && item.product.promoPrice !== undefined;
                  const price = hasPromo ? Number(item.product.promoPrice) : Number(item.product.price);
                  return (
                    <div key={item.product.id} className="flex justify-between items-center py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 truncate pr-2">{item.product.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.quantity}× R$ {price.toFixed(2)}</p>
                      </div>
                      <span className="text-xs font-extrabold text-primary flex-shrink-0">R$ {(price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs">
              <button
                type="button"
                onClick={() => setCouponOpen(!couponOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  {couponData ? (
                    <span className="text-emerald-600">Cupom aplicado: <strong>{couponCode}</strong></span>
                  ) : "Tem um cupom de desconto?"}
                </span>
                {couponOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {couponOpen && (
                <div className="mt-3 space-y-2">
                  {couponData ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">{couponCode}</p>
                        <p className="text-xs font-bold text-emerald-600">
                          -{couponData.type === "percent" ? `${couponData.value}%` : `R$ ${Number(couponData.value).toFixed(2)}`} de desconto
                        </p>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-emerald-400 hover:text-rose-500 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Digite o cupom"
                        className="flex-1 border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary tracking-widest"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponInput}
                        className="bg-primary hover:bg-[#122e22] text-white text-[10px] font-black px-4 rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {couponLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : "Aplicar"}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-[10px] font-bold text-rose-600">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold text-gray-800">R$ {subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-bold flex items-center gap-1"><Tag className="h-3 w-3" /> Desconto</span>
                    <span className="font-extrabold">-R$ {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-semibold flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Entrega
                    {deliveryDays && <span className="text-gray-400 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{deliveryDays}</span>}
                  </span>
                  <span className="font-bold">
                    {deliveryFee === 0
                      ? <span className="text-emerald-600 font-extrabold">Grátis</span>
                      : `R$ ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {deliveryZone && (
                  <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" /> {deliveryZone}
                  </p>
                )}
                <div className="flex justify-between text-sm font-black text-primary border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-[#122e22] text-white font-extrabold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                <span>{submitting ? "Processando..." : "Confirmar e Fechar Pedido"}</span>
              </button>

              <p className="text-center text-[9px] text-gray-400 font-semibold">
                🔒 Pedido seguro • Seus dados estão protegidos
              </p>
            </div>
          </div>

        </form>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
