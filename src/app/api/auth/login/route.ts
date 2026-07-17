import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

// Default admin details for database offline fallbacks
const MOCK_ADMIN_EMAIL = "admin@agromil.com.br";
const MOCK_ADMIN_HASH = "$2a$10$tZ2v1i20X3p/WbE5kQ5Zle3kUoE7bWp1u5o34mU4v5k6h7mU4v5k6"; // "Agromil2026!"

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
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Migration Trigger: If login fails in Supabase Auth, check if they exist in legacy public AdminUser table
      if (error) {
        const legacyAdmin = await dbService.getAdminUser(email);
        if (legacyAdmin) {
          const isValidLegacyPass = await bcrypt.compare(password, legacyAdmin.password);
          if (isValidLegacyPass) {
            // Auto-register legacy admin inside Supabase Auth
            const signUpResult = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name: legacyAdmin.name,
                  role: "admin",
                },
              },
            });

            if (!signUpResult.error && signUpResult.data.user) {
              const newUuid = signUpResult.data.user.id;
              
              // Update public.AdminUser table with new UUID
              await dbService.updateAdminUserId(legacyAdmin.id, newUuid);
              
              // Attempt login again to get session
              const retryLogin = await supabase.auth.signInWithPassword({ email, password });
              data = retryLogin.data;
              error = retryLogin.error as any;
            }
          }
        }
      }

      if (error || !data.user || !data.session) {
        return NextResponse.json(
          { error: "Credenciais inválidas." },
          { status: 401 }
        );
      }

      const user = data.user;
      const session = data.session;

      // Verify role is admin
      const isAdminRole = user.user_metadata?.role === "admin";
      const adminProfile = await dbService.getAdminUser(email);

      if (!isAdminRole && !adminProfile) {
        await supabase.auth.signOut();
        return NextResponse.json(
          { error: "Acesso restrito. Este usuário não é um administrador." },
          { status: 403 }
        );
      }

      // Set session cookies
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
        user: {
          name: user.user_metadata?.name || adminProfile?.name || "Administrador",
          email: user.email,
          role: "admin",
        },
      });
    }

    // 2. Fallback Mock (Offline Mode)
    const user = await dbService.getAdminUser(email);
    let isValidPassword = false;

    if (user) {
      isValidPassword = await bcrypt.compare(password, user.password);
    } else if (email.toLowerCase() === MOCK_ADMIN_EMAIL.toLowerCase()) {
      // Hardcoded fallback if database is empty/offline
      isValidPassword = await bcrypt.compare(password, MOCK_ADMIN_HASH);
    }

    const matchedUser = user || (isValidPassword ? {
      id: "mock-admin-id",
      name: "Agromil Admin",
      email: MOCK_ADMIN_EMAIL,
      role: "admin",
    } : null);

    if (!matchedUser || !isValidPassword) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: "admin",
    });

    const cookieStore = await cookies();
    cookieStore.set("agromil_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      message: "Login efetuado com sucesso (Modo Offline).",
      user: {
        name: matchedUser.name,
        email: matchedUser.email,
        role: "admin",
      },
    });

  } catch (error: any) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
