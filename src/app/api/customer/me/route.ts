import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";

export async function GET() {
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
        return NextResponse.json({ session: null });
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
        return NextResponse.json({ session: null });
      }

      // Load profile details from public schema
      const customer = await dbService.getCustomerById(user.id);
      if (!customer) {
        return NextResponse.json({ session: null });
      }

      const { password, ...safeCustomer } = customer as any;
      return NextResponse.json({ session: safeCustomer });
    }

    // 2. Fallback Mock (Offline Mode)
    const token = cookieStore.get("agromil_customer_token")?.value;
    if (!token) {
      return NextResponse.json({ session: null });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "customer") {
      return NextResponse.json({ session: null });
    }

    const customer = await dbService.getCustomerById(payload.userId);
    if (!customer) {
      return NextResponse.json({ session: null });
    }

    const { password, ...safeCustomer } = customer as any;
    return NextResponse.json({ session: safeCustomer });

  } catch (error) {
    console.error("Get customer session error:", error);
    return NextResponse.json({ session: null });
  }
}
