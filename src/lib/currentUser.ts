import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Temporary default user while auth is out of scope. Replace with session user id later. */
export const DEFAULT_USER_ID = "8f3c2e1a-9b4d-4f6e-a7c8-9d0e1f2a3b4c";

export const DEFAULT_USER_NAME = "Alex";

export async function ensureDefaultUser(): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("users").upsert(
    {
      id: DEFAULT_USER_ID,
      name: DEFAULT_USER_NAME,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to ensure default user: ${error.message}`);
  }
}
