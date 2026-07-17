import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { approved } = await req.json();

    if (approved === undefined) {
      return NextResponse.json({ error: "Campo approved é obrigatório." }, { status: 400 });
    }

    const updated = await dbService.updateReview(id, approved);
    if (!updated) {
      return NextResponse.json({ error: "Avaliação não encontrada." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/reviews/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao moderar avaliação." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await dbService.deleteReview(id);
    return NextResponse.json({ message: "Avaliação excluída com sucesso." });
  } catch (error: any) {
    console.error("DELETE /api/reviews/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir avaliação." }, { status: 500 });
  }
}
export async function GET() {
  try {
    const reviews = await dbService.getAdminReviews();
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("GET /api/reviews/[id] error:", error);
    return NextResponse.json({ error: "Erro ao buscar avaliações." }, { status: 500 });
  }
}
