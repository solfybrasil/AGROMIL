import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    let customerId: string | null = null;

    // ── 1. Supabase Auth (modo online) ──────────────────────────
    if (supabase) {
      let accessToken = cookieStore.get("agromil_access_token")?.value;
      const refreshToken = cookieStore.get("agromil_refresh_token")?.value;

      // Tenta renovar sessão se só tiver refresh token
      if (!accessToken && refreshToken) {
        const { data } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (data.session) accessToken = data.session.access_token;
      }

      if (accessToken) {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user?.id) customerId = user.id;
      }
    }

    // ── 2. JWT fallback (modo offline / sem Supabase) ────────────
    if (!customerId) {
      const token = cookieStore.get("agromil_customer_token")?.value;
      if (token) {
        const payload = verifyToken(token);
        if (payload?.role === "customer") customerId = payload.userId;
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const orders = await dbService.getCustomerOrders(customerId);
    return NextResponse.json(orders ?? []);

  } catch (error: any) {
    console.error("GET /api/customer/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar pedidos." },
      { status: 500 }
    );
  }
}
