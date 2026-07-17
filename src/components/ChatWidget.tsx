"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, X, Send, ArrowRight, Package, Clock } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  quickReplies?: Array<{ label: string; action: () => void; link?: string }>;
}

interface ActiveOrder {
  id: string;
  displayId: string;
  status: string;
  total: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  NEW:               { label: "Aguardando confirmação", color: "text-amber-600",  emoji: "🕐" },
  CONFIRMED:         { label: "Confirmado",             color: "text-blue-600",   emoji: "✅" },
  PREPARING:         { label: "Em preparação",          color: "text-orange-500", emoji: "📦" },
  OUT_FOR_DELIVERY:  { label: "Saiu para entrega",      color: "text-primary",    emoji: "🚚" },
  READY_FOR_PICKUP:  { label: "Pronto para retirada",   color: "text-primary",    emoji: "🏪" },
};

const ACTIVE_STATUSES = ["NEW", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "READY_FOR_PICKUP"];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [checked, setChecked] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for active orders on mount
  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const res = await fetch("/api/pedidos/ativos");
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setActiveOrder(data.order);
            // Auto-show after 2s if there's an active order
            setTimeout(() => setHasUnread(true), 2000);
          }
        }
      } catch {
        // Silently fail — no active order check if API unavailable
      } finally {
        setChecked(true);
      }
    };
    checkActiveOrder();
  }, []);

  // Build welcome message when chat opens
  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const orderStatusInfo = activeOrder ? STATUS_LABELS[activeOrder.status] : null;
    const welcomeMsgs: Message[] = [
      {
        id: "w-1",
        sender: "bot",
        text: activeOrder
          ? `Olá! Estou acompanhando o seu pedido **#${activeOrder.displayId}**. ${orderStatusInfo?.emoji ?? ""} Status atual: ${orderStatusInfo?.label ?? activeOrder.status}.`
          : "Olá! Seja bem-vindo ao suporte Agromil 🌱.",
        timestamp: new Date(),
      },
      {
        id: "w-2",
        sender: "bot",
        text: "Como posso ajudar?",
        timestamp: new Date(),
        quickReplies: [
          { label: "📦 Ver meu pedido", action: () => handleQuickReply("Ver meu pedido", "/pedidos"), link: "/pedidos" },
          { label: "📞 Falar no WhatsApp", action: () => handleWhatsApp() },
          { label: "⏰ Horário & Endereço", action: () => handleBotReply("horario") },
        ],
      },
    ];
    setMessages(welcomeMsgs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleWhatsApp = () => {
    const orderText = activeOrder
      ? `Olá, preciso de suporte sobre o pedido %23${activeOrder.displayId}.`
      : "Olá, preciso de suporte na Agromil.";
    window.open(`https://wa.me/551140233503?text=${orderText}`, "_blank");
  };

  const handleQuickReply = (label: string, url: string) => {
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: label, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: "Clique no botão abaixo para acessar:",
        timestamp: new Date(),
        quickReplies: [{ label: "Acessar →", action: () => setIsOpen(false), link: url }],
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  const handleBotReply = (topic: string) => {
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: "Horário & Endereço", timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies: Record<string, string> = {
        horario: "📍 Av. Caetano Ruggieri, 2191 - Parque Res. Mayard, Itu/SP\n⏰ Seg–Sex: 7h30–18h | Sáb: 7h30–13h",
      };
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: replies[topic] ?? "Em que mais posso ajudar?",
        timestamp: new Date(),
        quickReplies: [{ label: "📞 Falar no WhatsApp", action: handleWhatsApp }],
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = text.toLowerCase();
      let reply = "Não entendi bem. Deseja falar com nosso atendente humano?";
      if (lower.includes("frete") || lower.includes("entrega"))
        reply = "Frete grátis em Itu/SP para compras acima de R$ 150. Para outras cidades, calculamos pelo CEP no checkout.";
      else if (lower.includes("horario") || lower.includes("aberto"))
        reply = "📍 Av. Caetano Ruggieri, 2191 - Parque Res. Mayard, Itu/SP\n⏰ Seg–Sex: 7h30–18h | Sáb: 7h30–13h";
      else if (lower.includes("pedido") || lower.includes("status"))
        reply = "Acompanhe seu pedido em tempo real em 'Meus Pedidos' na sua conta.";
      else if (lower.includes("pix") || lower.includes("pagamento"))
        reply = "Aceitamos Pix, Cartão na entrega e Dinheiro (informe troco nas observações).";

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: reply,
        timestamp: new Date(),
        quickReplies: [
          { label: "📞 Falar no WhatsApp", action: handleWhatsApp },
          { label: "📦 Meus Pedidos", action: () => {}, link: "/pedidos" },
        ],
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const toggleWidget = () => {
    setIsOpen((v) => !v);
    setHasUnread(false);
  };

  // Only show if there's an active order (checked to avoid flicker)
  if (!checked || !activeOrder) return null;

  const orderInfo = STATUS_LABELS[activeOrder.status];

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating Button — iFood style order tracker pill */}
      <button
        onClick={toggleWidget}
        className="group flex items-center gap-3 bg-[#0c1f16] hover:bg-[#1b4332] text-white pl-3 pr-4 py-2.5 rounded-2xl shadow-2xl hover:shadow-primary/20 transition-all duration-300 relative cursor-pointer border border-white/10"
      >
        {/* Animated icon */}
        <div className="flex-shrink-0 bg-primary/20 rounded-xl p-1.5">
          <Package className={`h-4 w-4 text-emerald-400 ${activeOrder.status === "OUT_FOR_DELIVERY" ? "animate-bounce" : ""}`} />
        </div>

        {/* Text info */}
        <div className="text-left">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Pedido #{activeOrder.displayId}</p>
          <p className={`text-[11px] font-extrabold mt-0.5 leading-none ${orderInfo?.color ?? "text-emerald-400"}`}>
            {orderInfo?.emoji} {orderInfo?.label ?? activeOrder.status}
          </p>
        </div>

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 border-2 border-white animate-bounce flex items-center justify-center">
            <span className="text-[7px] font-black text-white">!</span>
          </span>
        )}

        {/* Pulse ring when delivering */}
        {activeOrder.status === "OUT_FOR_DELIVERY" && !isOpen && (
          <span className="absolute inset-0 rounded-2xl ring-2 ring-primary/40 animate-ping opacity-30 pointer-events-none" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] h-[420px] bg-white border border-gray-150 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          {/* Header */}
          <div className="bg-[#0c1f16] text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/20 rounded-xl p-1.5">
                <Package className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Acompanhar Pedido</p>
                <p className="text-xs font-extrabold text-white mt-0.5">#{activeOrder.displayId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/pedidos"
                className="text-[9px] font-black text-emerald-400 hover:text-white border border-emerald-800 hover:border-white/20 px-2.5 py-1 rounded-lg transition-colors"
              >
                Ver Pedido →
              </Link>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors ml-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Order status bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Status atual</p>
              <p className={`text-xs font-extrabold leading-none ${orderInfo?.color ?? "text-primary"}`}>
                {orderInfo?.emoji} {orderInfo?.label ?? activeOrder.status}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[9px] font-bold text-gray-400">Total</p>
              <p className="text-xs font-extrabold text-gray-800">R$ {Number(activeOrder.total).toFixed(2)}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-gray-50/30">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div key={m.id} className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs font-semibold leading-relaxed whitespace-pre-line ${
                    isBot ? "bg-white text-gray-800 border border-gray-100 shadow-3xs" : "bg-primary text-white"
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[8px] text-gray-300 mt-1 font-bold">
                    {m.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isBot && m.quickReplies && (
                    <div className="flex flex-col gap-1.5 mt-2 w-full">
                      {m.quickReplies.map((r, i) =>
                        r.link ? (
                          <Link
                            key={i}
                            href={r.link}
                            onClick={r.action}
                            className="w-fit border border-primary text-primary hover:bg-primary hover:text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>{r.label}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <button
                            key={i}
                            onClick={r.action}
                            className="w-fit border border-primary text-primary hover:bg-primary hover:text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-colors text-left"
                          >
                            {r.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {isTyping && (
              <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl px-3.5 py-2.5 w-fit shadow-3xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Text input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-150 p-2.5 bg-white flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dúvida sobre o pedido..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary font-semibold"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-primary hover:bg-[#1b4332] text-white p-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 fill-current" />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
