import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const banners = await dbService.getActiveBanners();
    return NextResponse.json(banners);
  } catch (error: any) {
    console.error("GET /api/banners error:", error);
    return NextResponse.json({ error: "Erro ao buscar banners." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, imageUrl, linkUrl, linkLabel, bgColor, textColor, active, displayOrder, expiresAt } = body;

    if (!title) {
      return NextResponse.json({ error: "Título do banner é obrigatório." }, { status: 400 });
    }

    const newBanner = await dbService.createBanner({
      title,
      subtitle: subtitle || null,
      imageUrl: imageUrl || null,
      linkUrl: linkUrl || null,
      linkLabel: linkLabel || null,
      bgColor: bgColor || "#1b4332",
      textColor: textColor || "#ffffff",
      active: active !== false,
      displayOrder: Number(displayOrder || 0),
      expiresAt: expiresAt || null
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/banners error:", error);
    return NextResponse.json({ error: "Erro ao criar banner." }, { status: 500 });
  }
}
