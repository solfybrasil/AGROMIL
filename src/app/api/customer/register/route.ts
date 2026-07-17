import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, street, number, complement, neighborhood, city, state, zipCode } = body;

    if (!name || !email || !password || !phone || !street || !number || !neighborhood || !zipCode) {
      return NextResponse.json(
        { error: "Por favor, preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Supabase Auth (Online Mode)
    if (supabase) {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: "customer",
          },
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const user = data.user;
      if (!user) {
        return NextResponse.json({ error: "Erro ao criar usuário no Supabase Auth." }, { status: 500 });
      }

      // Check if user already has a public profile
      const existing = await dbService.getCustomerById(user.id);
      if (!existing) {
        // Create public Customer profile with UUID from auth.users
        await dbService.createCustomer({
          id: user.id,
          name,
          email,
          password: "supabase-auth-managed", // Dummy password to satisfy Prisma constraints
          phone,
          street,
          number,
          complement: complement || null,
          neighborhood,
          city: city || "Itu",
          state: state || "SP",
          zipCode,
        });
      }

      // If session is returned (email confirmation disabled), set cookies
      if (data.session) {
        const cookieStore = await cookies();
        cookieStore.set("agromil_access_token", data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: data.session.expires_in,
          path: "/",
        });
        if (data.session.refresh_token) {
          cookieStore.set("agromil_refresh_token", data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
          });
        }
      }

      return NextResponse.json({
        message: "Conta criada com sucesso.",
        customer: {
          id: user.id,
          name,
          email,
        },
      }, { status: 201 });
    }

    // 2. Fallback Mock (Offline Mode)
    const existing = await dbService.getCustomerByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const mockId = `cust-${Date.now()}`;
    const customer = await dbService.createCustomer({
      id: mockId,
      name,
      email,
      password: hashedPassword,
      phone,
      street,
      number,
      complement: complement || null,
      neighborhood,
      city: city || "Itu",
      state: state || "SP",
      zipCode,
    });

    const token = generateToken({
      userId: customer.id,
      name: customer.name,
      email: customer.email,
      role: "customer",
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
      message: "Conta criada com sucesso (Modo Offline).",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register Customer API error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao cadastrar cliente." },
      { status: 500 }
    );
  }
}
