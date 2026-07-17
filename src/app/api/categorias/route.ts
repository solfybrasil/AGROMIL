import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const categories = await dbService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categorias error:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await dbService.createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categorias error:", error);
    return NextResponse.json({ error: error.message || "Erro ao cadastrar categoria." }, { status: 500 });
  }
}
