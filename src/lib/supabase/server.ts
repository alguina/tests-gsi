import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");
}

/**
 * Server-side client. Uses the service_role key, which only lives in the
 * hosting environment (never NEXT_PUBLIC_): every read and write goes
 * through this server, so the public anon key no longer needs any access.
 */
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("MISSING_SUPABASE_CONFIG");
  }

  return createClient(normalizeSupabaseUrl(url), serviceKey);
}
