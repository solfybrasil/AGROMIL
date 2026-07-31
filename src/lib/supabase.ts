import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ntouxmjmlrjehjsqkowr.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_3GsO7ESFnezucuIIWlrT8A_K9acM4XN";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50b3V4bWptbHJqZWhqc3Frb3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDExNTQyMCwiZXhwIjoyMDk5NjkxNDIwfQ.fyY5KCmRyZuVlUyMrZ9AzrTes7Rp-pntrH6DwYoiNsM";

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

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL") || DEFAULT_SUPABASE_URL;
const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_SERVICE_ROLE_KEY") || DEFAULT_SERVICE_ROLE_KEY;
const supabasePublishableKey = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY") || DEFAULT_PUBLISHABLE_KEY;

const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://");
};

// ── Service Role client (full access) ──────────────────────────────────────────
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

// ── Anon/Publishable client (read-only fallback) ─────────────────────────────
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

if (typeof window === "undefined") {
  if (supabase) {
    console.info("[supabase] ✅ Service role client active");
  } else if (supabaseAnon) {
    console.info("[supabase] ⚠️  Using anon/publishable key");
  } else {
    console.warn("[supabase] ❌ No Supabase client configured");
  }
}
