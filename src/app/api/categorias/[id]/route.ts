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
    
    const updated = await dbService.updateCategory(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Categoria não encontrada ou falha ao atualizar." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/categorias/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar categoria." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    await dbService.deleteCategory(id);
    return NextResponse.json({ message: "Categoria removida com sucesso." });
  } catch (error: any) {
    console.error("DELETE /api/categorias/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir categoria." }, { status: 500 });
  }
}
