import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const search = searchParams.get("q") || undefined;
    
    // In API route, we default to including inactive products since it's mainly for admin CRUD
    const includeInactive = searchParams.get("activeOnly") !== "true";

    const products = await dbService.getProducts({
      categoryId,
      featured,
      search,
      includeInactive,
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/produtos error:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await dbService.createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/produtos error:", error);
    return NextResponse.json({ error: error.message || "Erro ao cadastrar produto." }, { status: 500 });
  }
}
