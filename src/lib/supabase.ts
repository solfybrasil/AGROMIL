import { createClient, SupabaseClient } from "@supabase/supabase-js";

const getEnv = (key: string, viteKey: string) => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }
  return undefined;
};

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL");
const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_SERVICE_ROLE_KEY");
const supabasePublishableKey = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY");

const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://");
};

// ── Service Role client (full access, server-side only) ──────────────────────
export const isSupabaseConfigured = !!(
  isValidUrl(supabaseUrl) &&
  supabaseServiceKey &&
  !supabaseServiceKey.includes("YOUR_")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false },
    })
  : null;

// ── Anon/Publishable client (read-only public data, fallback) ────────────────
const isAnonymousConfigured = !!(
  isValidUrl(supabaseUrl) &&
  supabasePublishableKey &&
  !supabasePublishableKey.includes("YOUR_")
);

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
