import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// ── Service Role client (full access, server-side only) ──────────────────────
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseServiceKey.includes("YOUR_")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false },
    })
  : null;

// ── Anon/Publishable client (read-only public data, fallback) ────────────────
const isAnonymousConfigured = !!(supabaseUrl && supabasePublishableKey);

export const supabaseAnon: SupabaseClient | null = isAnonymousConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: { persistSession: false },
    })
  : null;

// ── Best available client: prefers service role, falls back to anon ──────────
export const db: SupabaseClient | null = supabase ?? supabaseAnon;

// Debug log (server-side only — won't appear in browser bundles)
if (typeof window === "undefined") {
  if (supabase) {
    console.info("[supabase] ✅ Service role client active");
  } else if (supabaseAnon) {
    console.info("[supabase] ⚠️  Using anon/publishable key (limited write access)");
  } else {
    console.warn("[supabase] ❌ No Supabase client configured — falling back to mock data");
  }
}
