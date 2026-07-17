import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";

async function getCustomerIdFromCookies() {
  const cookieStore = await cookies();
  let customerId: string | null = null;

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

  if (!customerId) {
    const token = cookieStore.get("agromil_customer_token")?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload?.role === "customer") customerId = payload.userId;
    }
  }

  return customerId;
}

export async function GET(req: NextRequest) {
  try {
    const customerId = await getCustomerIdFromCookies();
    if (!customerId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const checkIds = searchParams.get("checkIds");

    if (checkIds) {
      // Check which IDs are favorited
      const idsArray = checkIds.split(",");
      const favoritedIds = await dbService.checkFavorites(customerId, idsArray);
      return NextResponse.json(favoritedIds);
    }

    const favorites = await dbService.getCustomerFavorites(customerId);
    return NextResponse.json(favorites);
  } catch (error: any) {
    console.error("GET /api/favoritos error:", error);
    return NextResponse.json({ error: "Erro ao carregar favoritos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const customerId = await getCustomerIdFromCookies();
    if (!customerId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
    }

    await dbService.addFavorite(customerId, productId);
    return NextResponse.json({ success: true, message: "Produto adicionado aos favoritos." });
  } catch (error: any) {
    console.error("POST /api/favoritos error:", error);
    return NextResponse.json({ error: "Erro ao adicionar favorito." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const customerId = await getCustomerIdFromCookies();
    if (!customerId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
    }

    await dbService.removeFavorite(customerId, productId);
    return NextResponse.json({ success: true, message: "Produto removido dos favoritos." });
  } catch (error: any) {
    console.error("DELETE /api/favoritos error:", error);
    return NextResponse.json({ error: "Erro ao remover favorito." }, { status: 500 });
  }
}
