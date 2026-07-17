import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

const ACTIVE_STATUSES = ["NEW", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "READY_FOR_PICKUP"];

async function getCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  
  // Try Supabase session first
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

  // Fallback to JWT cookie
  const jwtToken = cookieStore.get("agromil_customer_token")?.value;
  if (jwtToken) {
    const payload = verifyToken(jwtToken);
    if (payload?.role === "customer") return payload.userId;
  }

  return null;
}

export async function GET(_req: NextRequest) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ order: null });
    }

    if (!supabase) {
      return NextResponse.json({ order: null });
    }

    // Get most recent active order for this customer
    const { data, error } = await supabase
      .from("Order")
      .select("id, status, total, createdAt")
      .eq("customerId", customerId)
      .in("status", ACTIVE_STATUSES)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ order: null });
    }

    // Format a short display ID from the UUID
    const displayId = data.id.slice(-6).toUpperCase();

    return NextResponse.json({
      order: {
        id: data.id,
        displayId,
        status: data.status,
        total: data.total,
      },
    });
  } catch (err) {
    console.error("GET /api/pedidos/ativos error:", err);
    return NextResponse.json({ order: null });
  }
}
