import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Temporary default user while auth is out of scope. Replace with session user id later. */
export const DEFAULT_USER_ID = "8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c";

export const DEFAULT_USER_NAME = "Alex";

export async function ensureDefaultUser(): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error: rpcError } = await supabase.rpc("ensure_default_user");

  if (!rpcError) {
    return;
  }

  const { data: existing, error: selectError } = await supabase
    .from("users")
    .select("id")
    .eq("id", DEFAULT_USER_ID)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to ensure default user: ${selectError.message}`);
  }

  if (existing) {
    return;
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: DEFAULT_USER_ID,
    name: DEFAULT_USER_NAME,
  });

  if (insertError) {
    throw new Error(`Failed to ensure default user: ${insertError.message}`);
  }
}
