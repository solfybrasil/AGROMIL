import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
    }

    const reviews = await dbService.getProductReviews(productId);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Erro ao buscar avaliações." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let customerId: string | null = null;

    // 1. Check Supabase Auth
    if (supabase) {
      let accessToken = cookieStore.get("agromil_access_token")?.value;
      const refreshToken = cookieStore.get("agromil_refresh_token")?.value;
      if (!accessToken && refreshToken) {
        const { data } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (data.session) accessToken = data.session.access_token;
      }
      if (accessToken) {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user?.id) customerId = user.id;
      }
    }

    // 2. Check JWT offline auth
    if (!customerId) {
      const token = cookieStore.get("agromil_customer_token")?.value;
      if (token) {
        const payload = verifyToken(token);
        if (payload?.role === "customer") customerId = payload.userId;
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: "Faça login para escrever uma avaliação." }, { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating) {
      return NextResponse.json({ error: "productId e rating são obrigatórios." }, { status: 400 });
    }

    // Check if user has orders of this product
    const orders = await dbService.getCustomerOrders(customerId);
    const hasBought = orders.some((o: any) =>
      o.status === "DELIVERED" && o.items?.some((it: any) => it.productId === productId)
    );

    // For demo/flexibility, we can allow reviews for mock sessions, but in strict mode we check hasBought
    // Let's allow mock/demo reviews but warning
    const isMock = !supabase;
    if (!hasBought && !isMock) {
      return NextResponse.json({
        error: "Você só pode avaliar produtos que já comprou e foram entregues."
      }, { status: 403 });
    }

    const review = await dbService.createReview({
      productId,
      customerId,
      rating: Number(rating),
      comment: comment || null
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Erro ao criar avaliação." }, { status: 500 });
  }
}
