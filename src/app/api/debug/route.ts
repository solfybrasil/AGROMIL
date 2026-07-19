import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const hasPrismaUrl = !!(
    dbUrl &&
    !dbUrl.includes("localhost:51213") &&
    !dbUrl.includes("[SUA-SENHA]") &&
    !dbUrl.includes("[YOUR-PASSWORD]")
  );

  const hasSupabase = !!(supabaseUrl && serviceKey && !serviceKey.includes("YOUR_"));

  // Test Supabase connection directly
  let supabaseTest: any = null;
  if (hasSupabase) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(supabaseUrl!, serviceKey!);
      const { data, error } = await client.from("Product").select("id").limit(1);
      supabaseTest = error ? { error: error.message, code: error.code } : { ok: true, sampleId: data?.[0]?.id ?? "empty" };
    } catch (e: any) {
      supabaseTest = { error: e.message };
    }
  }

  // Test Prisma connection
  let prismaTest: any = null;
  if (hasPrismaUrl) {
    try {
      const { default: prisma } = await import("@/lib/prisma");
      const count = await (prisma as any).product.count();
      prismaTest = { ok: true, count };
    } catch (e: any) {
      prismaTest = { error: e.message };
    }
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vars: {
      DATABASE_URL: dbUrl ? `${dbUrl.slice(0, 25)}...` : "❌ NOT SET",
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ?? "❌ NOT SET",
      SUPABASE_SERVICE_ROLE_KEY: serviceKey ? `${serviceKey.slice(0, 20)}...` : "❌ NOT SET",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey ? `${publishableKey.slice(0, 20)}...` : "❌ NOT SET",
    },
    flags: {
      hasPrismaUrl,
      hasSupabase,
    },
    tests: {
      supabase: supabaseTest,
      prisma: prismaTest,
    },
  });
}
