import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Detect if we have Supabase API keys configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey && !supabaseServiceKey.includes("YOUR_"));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!)
  : null;
