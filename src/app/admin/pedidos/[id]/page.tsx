"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, MapPin, CreditCard, ShoppingBag, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

interface OrderDetails {
  id: string;
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
  status: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

const DEFAULT_ORDERS_DETAILS: Record<string, OrderDetails> = {
  "AGR-1002": {
    id: "AGR-1002",
    clientName: "José da Silva",
    clientPhone: "(11) 97123-4567",
    clientEmail: "jose.silva@email.com",
    street: "Rua das Palmeiras",
    number: "45",
    complement: "Casa",
    neighborhood: "Itu Novo Centro",
    city: "Itu",
    state: "SP",
    zipCode: "13309-300",
    paymentMethod: "pix",
    subtotal: 189.80,
    deliveryFee: 0,
    total: 189.80,
    status: "NEW",
    createdAt: "15/07/2026 09:30",
    items: [
      { productId: "m-4", productName: "Ração Premium Especial Cães 15kg", quantity: 1, price: 189.90 },
    ],
  },
  "AGR-1001": {
    id: "AGR-1001",
    clientName: "Maria de Souza",
    clientPhone: "(11) 98888-7777",
    street: "Av. Francisco Ernesto Fávero",
    number: "500",
    complement: "Bloco B - Apto 32",
    neighborhood: "Rancho Grande",
    city: "Itu",
    state: "SP",
    zipCode: "13306-010",
    paymentMethod: "money",
    subtotal: 110.00,
    deliveryFee: 0,
    total: 110.00,
    status: "PREPARING",
    createdAt: "14/07/2026 15:45",
    items: [
      { productId: "m-6", productName: "Sal Mineral 80 Bovinos 25kg", quantity: 1, price: 110.00 },
    ],
  },
};

export default function AdminOrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("NEW");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      // 1. Check local session storage first (in case it was created via checkout demo)
      const stored = sessionStorage.getItem(`temp_order_${orderId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const parsedDetails: OrderDetails = {
            id: orderId,
            ...parsed,
            status: parsed.status || "NEW",
            createdAt: parsed.createdAt || new Date().toLocaleString("pt-BR"),
          };
          setOrder(parsedDetails);
          setStatus(parsedDetails.status);
        } catch (e) {
          console.error("Error parsing stored order details", e);
        }
        setLoading(false);
        return;
      }

      // 2. Fetch from database API
      try {
        const res = await fetch(`/api/pedidos/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setStatus(data.status);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Pedidos API offline. Using local static mocks.", err);
      }

      // 3. Fallback to default mock list
      const mock = DEFAULT_ORDERS_DETAILS[orderId];
      if (mock) {
        setOrder(mock);
        setStatus(mock.status);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setUpdating(true);
    setMessage("");

    try {
      const res = await fetch(`/api/pedidos/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMessage("Status do pedido atualizado com sucesso.");
        setUpdating(false);
        return;
      }
    } catch (err) {
      console.warn("Could not save status via API. Updating locally.", err);
    }

    // Fallback Mock save
    // If it was loaded from sessionStorage, update it there too
    const stored = sessionStorage.getItem(`temp_order_${orderId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.status = newStatus;
        sessionStorage.setItem(`temp_order_${orderId}`, JSON.stringify(parsed));
      } catch (e) {
        console.error(e);
      }
    }
    
    if (order) {
      setOrder({ ...order, status: newStatus });
    }
    setMessage("Status atualizado localmente (Modo Demo).");
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="text-center py-10 select-none">
        <span className="text-xs font-bold text-gray-500">Carregando detalhes do pedido...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10 select-none">
        <span className="text-4xl">🌾</span>
        <h2 className="text-lg font-bold text-gray-800 mt-4">Pedido não localizado</h2>
        <p className="text-xs text-gray-500 mt-2">O pedido #{orderId} não foi encontrado em nosso sistema.</p>
        <Link href="/admin/pedidos" className="mt-4 inline-block bg-primary text-white text-xs font-bold px-6 py-2 rounded-lg">
          Voltar para Lista
        </Link>
      </div>
    );
  }

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "pix":
        return "Pix (na entrega)";
      case "card":
        return "Cartão de Crédito/Débito (na entrega)";
      case "money":
        return "Dinheiro (na entrega)";
      default:
        return method;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Back button */}
      <div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Pedidos</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-[#1b4332]">Pedido {order.id}</h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Recebido em: {order.createdAt}</span>
          </p>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3 shadow-2xs self-start md:self-auto">
          <span className="text-xs font-bold text-gray-500">Status:</span>
          <select
            value={status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-white border-0 text-xs font-extrabold text-primary focus:ring-0 cursor-pointer"
          >
            <option value="NEW">Novo</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PREPARING">Preparando</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
          <CheckCircle className="h-4.5 w-4.5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Grid Layout info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Customer Info and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items */}
          <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <ShoppingBag className="h-4.5 w-4.5 text-primary" />
              Itens do Pedido
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                  <div>
                    <span className="font-bold text-gray-800">{item.productName}</span>
                    <span className="text-gray-400 ml-2">({item.quantity}x)</span>
                  </div>
                  <span className="font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-150 pt-4 space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">R$ {Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Entrega</span>
                <span className="font-bold text-gray-800">
                  {Number(order.deliveryFee) === 0 ? "Grátis" : `R$ ${Number(order.deliveryFee).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-primary border-t border-gray-200 pt-3">
                <span>Total Geral</span>
                <span>R$ {Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-6 space-y-2">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Observações do Cliente</h3>
              <p className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 italic leading-relaxed">
                "{order.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Delivery and Payment info */}
        <div className="space-y-6">
          {/* Customer and Delivery info */}
          <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-primary" />
              Dados do Cliente
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-gray-600">
              <div>
                <span className="font-bold text-gray-800 block">Nome Completo:</span>
                <span>{order.clientName}</span>
              </div>
              <div>
                <span className="font-bold text-gray-800 block">WhatsApp:</span>
                <a
                  href={`https://wa.me/${order.clientPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  {order.clientPhone} (Abrir Chat)
                </a>
              </div>
              {order.clientEmail && (
                <div>
                  <span className="font-bold text-gray-800 block">E-mail:</span>
                  <span>{order.clientEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              Endereço de Entrega
            </h3>

            <div className="space-y-2 text-xs leading-relaxed text-gray-600">
              <p className="font-bold text-gray-800">{order.street}, N° {order.number}</p>
              {order.complement && <p>Complemento: {order.complement}</p>}
              <p>Bairro: {order.neighborhood}</p>
              <p>Itu/SP - CEP: {order.zipCode}</p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-primary" />
              Método de Pagamento
            </h3>

            <div className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3">
              {getPaymentLabel(order.paymentMethod)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
