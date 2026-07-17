"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import CartDrawer from "@/components/CartDrawer";
import { CheckCircle2, MessageSquare, ShoppingBag, MapPin, CreditCard, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

interface OrderData {
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string | null;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isLocal = searchParams.get("local") === "true";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      // 1. Try to fetch local storage order if flag is set
      if (isLocal) {
        const stored = sessionStorage.getItem(`temp_order_${orderId}`);
        if (stored) {
          try {
            setOrder(JSON.parse(stored));
          } catch (e) {
            console.error("Error parsing stored temp order", e);
          }
          setLoading(false);
          return;
        }
      }

      // 2. Fetch from DB API
      try {
        const res = await fetch(`/api/pedidos/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order from database API", err);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, isLocal]);

  // Format payment method text
  const getPaymentLabel = (method?: string) => {
    switch (method) {
      case "pix":
        return "Pix (na entrega)";
      case "card":
        return "Cartão de Crédito/Débito (na entrega)";
      case "money":
        return "Dinheiro (na entrega)";
      default:
        return method || "A combinar";
    }
  };

  // Generate dynamic WhatsApp message link
  const getWhatsAppLink = () => {
    if (!order) return "#";

    const phoneStore = "551140233503"; // Agromil WhatsApp Number
    
    // Format text message
    let text = `*NOVO PEDIDO AGROMIL - N° ${orderId}*\n`;
    text += `----------------------------------\n`;
    text += `*Cliente:* ${order.clientName}\n`;
    text += `*WhatsApp:* ${order.clientPhone}\n`;
    text += `*Endereço:* ${order.street}, ${order.number} ${order.complement ? `- ${order.complement}` : ""}\n`;
    text += `*Bairro:* ${order.neighborhood}, ${order.city}/${order.state}\n`;
    text += `*CEP:* ${order.zipCode}\n\n`;
    
    text += `*Itens do Pedido:*\n`;
    order.items.forEach((item) => {
      text += `- ${item.quantity}x ${item.productName} (R$ ${(item.price * item.quantity).toFixed(2)})\n`;
    });
    text += `\n`;
    
    text += `*Subtotal:* R$ ${Number(order.subtotal).toFixed(2)}\n`;
    text += `*Taxa de Entrega:* ${order.deliveryFee === 0 ? "Grátis" : `R$ ${Number(order.deliveryFee).toFixed(2)}`}\n`;
    text += `*TOTAL:* R$ ${Number(order.total).toFixed(2)}\n\n`;
    
    text += `*Forma de Pagamento:* ${getPaymentLabel(order.paymentMethod)}\n`;
    if (order.notes) {
      text += `*Observações:* ${order.notes}\n`;
    }
    text += `----------------------------------\n`;
    text += `🌿 _Enviado pelo sistema de checkout Agromil_`;

    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${phoneStore}?text=${encodedText}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center p-10">
          <span className="text-sm font-bold text-gray-500">Carregando detalhes do pedido...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center select-none">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-gray-800 font-serif">Pedido não localizado</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Não conseguimos carregar as informações do seu pedido.</p>
          <Link href="/" className="mt-6 rounded-md bg-primary text-white px-6 py-2.5 text-sm font-bold hover:bg-primary-dark shadow-xs transition-all">
            Voltar para Início
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Horizontal Nav Bar */}
      <CategoryMenu />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
        {/* Visual Confirmation Banner */}
        <div className="text-center space-y-4 mb-10 select-none">
          <div className="rounded-full bg-primary-light p-4 w-20 h-20 flex items-center justify-center mx-auto mb-2 text-primary">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Sucesso</span>
          <h1 className="font-serif text-3xl font-extrabold text-[#1b4332]">Pedido Recebido!</h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Obrigado por comprar com a Agromil. Seu pedido foi registrado com sucesso em nosso sistema.
          </p>
        </div>

        {/* WhatsApp Dispatch Call to Action */}
        <div className="bg-[#e8f5e9]/70 border border-[#2d6a4f]/25 rounded-2xl p-6 text-center space-y-4 shadow-sm mb-8 select-none">
          <div className="flex items-center justify-center gap-1.5 text-primary-dark font-extrabold text-sm">
            <MessageSquare className="h-5 w-5 text-primary fill-current" />
            <span>Envie a cópia do pedido no WhatsApp!</span>
          </div>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Para agilizar o andamento da separação e entrega, clique no botão abaixo para enviar o resumo diretamente no nosso WhatsApp de vendas.
          </p>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-extrabold text-sm rounded-lg py-3 px-8 shadow-sm hover:shadow-md transition-all active:scale-98"
          >
            <span>Enviar Pedido pelo WhatsApp</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 select-none">
            <span className="text-xs font-bold text-gray-500 uppercase">Identificador</span>
            <span className="text-sm font-extrabold text-primary-dark">N° {orderId}</span>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2 select-none">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              Destinatário e Endereço
            </h3>
            <div className="text-xs text-gray-600 bg-[#fafafa] p-3 rounded-lg border border-gray-100 leading-relaxed">
              <p className="font-bold text-gray-800">{order.clientName}</p>
              <p className="mt-0.5">{order.clientPhone}</p>
              <p className="mt-1.5">{order.street}, N° {order.number} {order.complement ? `(${order.complement})` : ""}</p>
              <p>{order.neighborhood} - {order.city}/{order.state}</p>
              <p className="mt-0.5 text-gray-400">CEP: {order.zipCode}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 select-none">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" />
              Forma de Pagamento
            </h3>
            <div className="text-xs text-gray-600 bg-[#fafafa] p-3 rounded-lg border border-gray-100 font-bold">
              {getPaymentLabel(order.paymentMethod)}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 select-none">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Resumo das Compras
            </h3>
            
            <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100 text-xs">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-3 bg-white">
                  <div>
                    <span className="font-bold text-gray-800">{item.productName}</span>
                    <span className="text-gray-400 ml-2">({item.quantity}x)</span>
                  </div>
                  <span className="font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary pricing */}
          <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-gray-600 select-none">
            <div className="flex justify-between">
              <span>Subtotal dos Itens</span>
              <span className="font-bold text-gray-800">R$ {Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de Entrega</span>
              <span className="font-bold text-gray-800">
                {Number(order.deliveryFee) === 0 ? (
                  <span className="text-[#2d6a4f] font-semibold">Grátis</span>
                ) : (
                  `R$ ${Number(order.deliveryFee).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-primary border-t border-gray-100 pt-3">
              <span>Total Pago</span>
              <span>R$ {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link
            href="/pedidos"
            className="rounded-full bg-primary hover:bg-[#122e22] text-white px-8 py-3 text-sm font-extrabold shadow-md transition-all inline-flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Acompanhar Meu Pedido
          </Link>
          <Link
            href="/"
            className="rounded-full border border-gray-250 hover:bg-gray-50 text-gray-600 px-8 py-3 text-xs font-bold shadow-2xs transition-all inline-block"
          >
            Voltar para Início
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
