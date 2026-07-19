import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";
import * as bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let customerId: string | null = null;

    // 1. Authenticate user
    if (supabase) {
      const accessToken = cookieStore.get("agromil_access_token")?.value;
      if (accessToken) {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user) customerId = user.id;
      }
    }

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

    // 2. Parse request body
    const body = await req.json();
    const { name, phone, password, planType } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 });
    }

    const updateData: any = { name, phone };

    // Passwords hashing if requested
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // PlanType if requested (allow upgrades)
    if (planType) {
      updateData.planType = planType;
    }

    // 3. Update in Database
    const updated = await dbService.updateCustomer(customerId, updateData);
    if (!updated) {
      return NextResponse.json({ error: "Perfil não encontrado ou falha ao atualizar." }, { status: 404 });
    }

    // 4. Update in Supabase Auth user metadata if online
    if (supabase && supabase.auth) {
      const metadata: any = { name, phone };
      if (planType) metadata.planType = planType;
      
      const accessToken = cookieStore.get("agromil_access_token")?.value;
      if (accessToken) {
        await supabase.auth.updateUser({
          data: metadata
        });
      }
    }

    const { password: _, ...safeCustomer } = updated as any;
    return NextResponse.json({
      message: "Perfil atualizado com sucesso.",
      customer: safeCustomer
    });

  } catch (error: any) {
    console.error("PUT /api/customer/update error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar perfil." },
      { status: 500 }
    );
  }
}
