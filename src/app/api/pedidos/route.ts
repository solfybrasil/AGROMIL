import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const ACTIVE_STATUSES = ["NEW", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "READY_FOR_PICKUP"];

async function getCustomerIdFromRequest(): Promise<string | null> {
  try {
    const cookieStore = await cookies();

    if (supabase) {
      const accessToken = cookieStore.get("agromil_access_token")?.value;
      const refreshToken = cookieStore.get("agromil_refresh_token")?.value;
      let token = accessToken;

      if (!token && refreshToken) {
        const { data } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (data.session) token = data.session.access_token;
      }

      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) return user.id;
      }
    }

    const jwtToken = cookieStore.get("agromil_customer_token")?.value;
    if (jwtToken) {
      const payload = verifyToken(jwtToken);
      if (payload?.role === "customer") return payload.userId;
    }
  } catch {}
  return null;
}

export async function GET() {
  try {
    const orders = await dbService.getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/pedidos error:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, ...orderData } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "O pedido precisa conter itens." }, { status: 400 });
    }

    // ── Bloquear segundo pedido enquanto há um em aberto ──────────
    const customerId = orderData.customerId || (await getCustomerIdFromRequest());

    if (customerId && supabase) {
      const { data: activeOrders } = await supabase
        .from("Order")
        .select("id, status")
        .eq("customerId", customerId)
        .in("status", ACTIVE_STATUSES)
        .limit(1);

      if (activeOrders && activeOrders.length > 0) {
        const activeOrder = activeOrders[0];
        return NextResponse.json(
          {
            error: "Você já tem um pedido em andamento. Aguarde a entrega antes de fazer um novo pedido.",
            activeOrderId: activeOrder.id,
            code: "ACTIVE_ORDER_EXISTS",
          },
          { status: 409 }
        );
      }
    }
    // ── Validar estoque de cada item ──────────────────────────────
    for (const item of items) {
      const product = await dbService.getProductById(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Produto não localizado." }, { status: 400 });
      }
      if (product.stock <= 0) {
        return NextResponse.json(
          { error: `O produto "${product.name}" está temporariamente sem estoque.` },
          { status: 400 }
        );
      }
    }
    // ─────────────────────────────────────────────────────────────

    const order = await dbService.createOrder(orderData, items);

    if (orderData.couponCode) {
      await dbService.incrementCouponUses(orderData.couponCode);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    const message = error?.message || "Erro desconhecido ao criar pedido.";
    console.error("POST /api/pedidos error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
