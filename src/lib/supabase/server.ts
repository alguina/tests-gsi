import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");
}

export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("MISSING_SUPABASE_CONFIG");
  }

  return createClient(normalizeSupabaseUrl(url), anonKey);
}
