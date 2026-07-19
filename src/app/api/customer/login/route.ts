import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Supabase Auth (Online Mode)
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
      }

      const user = data.user;
      const session = data.session;
      if (!user || !session) {
        return NextResponse.json({ error: "Falha na sessão do Supabase." }, { status: 500 });
      }

      // Check if user has Customer role (either in metadata or in public Customer table)
      const isCustomerRole = user.user_metadata?.role === "customer";
      const customerProfile = await dbService.getCustomerById(user.id);

      if (!isCustomerRole && !customerProfile) {
        // Sign out if unauthorized role tries to log in as customer
        await supabase.auth.signOut();
        return NextResponse.json(
          { error: "Acesso restrito. Este usuário não é um cliente." },
          { status: 403 }
        );
      }

      // Set cookies
      const cookieStore = await cookies();
      cookieStore.set("agromil_access_token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: session.expires_in,
        path: "/",
      });
      if (session.refresh_token) {
        cookieStore.set("agromil_refresh_token", session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });
      }

      return NextResponse.json({
        message: "Login efetuado com sucesso.",
        customer: {
          id: user.id,
          name: user.user_metadata?.name || customerProfile?.name || "Cliente",
          email: user.email,
          planType: customerProfile?.planType || user.user_metadata?.planType || "COMUM",
        },
      });
    }

    // 2. Fallback Mock (Offline Mode)
    const customer = await dbService.getCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: customer.id,
      name: customer.name,
      email: customer.email,
      role: "customer",
      planType: customer.planType,
    });

    const cookieStore = await cookies();
    cookieStore.set("agromil_customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      message: "Login efetuado com sucesso (Modo Offline).",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        planType: customer.planType,
      },
    });

  } catch (error: any) {
    console.error("Login Customer API error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
