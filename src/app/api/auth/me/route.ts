import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { dbService } from "@/lib/db-service";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    // 1. Supabase Auth (Online Mode)
    if (supabase) {
      let accessToken = cookieStore.get("agromil_access_token")?.value;
      const refreshToken = cookieStore.get("agromil_refresh_token")?.value;

      // Try refreshing session if access token is missing but refresh token exists
      if (!accessToken && refreshToken) {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (!error && data.session) {
          accessToken = data.session.access_token;
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
      }

      if (!accessToken) {
        return NextResponse.json(
          { error: "Sessão expirada ou não autenticada." },
          { status: 401 }
        );
      }

      // Verify token with Supabase Auth
      let { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

      // If token expired, try refreshing session
      if ((userError || !user) && refreshToken) {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (!error && data.session && data.user) {
          accessToken = data.session.access_token;
          user = data.user;
          // Set new cookies
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
              maxAge: 60 * 60 * 24 * 30,
              path: "/",
            });
          }
        }
      }

      if (!user) {
        return NextResponse.json(
          { error: "Sessão expirada ou não autenticada." },
          { status: 401 }
        );
      }

      // Fetch public profile if needed or load from user metadata
      const adminProfile = await dbService.getAdminUser(user.email || "");

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.user_metadata?.name || adminProfile?.name || "Administrador",
          email: user.email,
          role: "admin",
        }
      });
    }

    // 2. Fallback Mock (Offline Mode)
    const token = cookieStore.get("agromil_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Sessão expirada ou não autenticada." },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: decoded });
  } catch (error) {
    console.error("Auth Me API route error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
