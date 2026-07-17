import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();
    const { active } = body;

    if (active === undefined) {
      return NextResponse.json({ error: "O campo 'active' é obrigatório." }, { status: 400 });
    }

    const updated = await dbService.updateProduct(id, { active });
    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado ou falha ao atualizar." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/produtos/[id]/toggle error:", error);
    return NextResponse.json({ error: "Erro ao atualizar status do produto." }, { status: 500 });
  }
}
