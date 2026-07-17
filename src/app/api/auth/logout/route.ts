import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    if (supabase) {
      await supabase.auth.signOut();
    }

    const cookieStore = await cookies();
    cookieStore.delete("agromil_token");
    cookieStore.delete("agromil_access_token");
    cookieStore.delete("agromil_refresh_token");

    return NextResponse.json({ message: "Logout efetuado com sucesso." });
  } catch (error) {
    console.error("Logout API route error:", error);
    return NextResponse.json(
      { error: "Erro ao efetuar logout." },
      { status: 500 }
    );
  }
}
