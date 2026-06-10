"use server";

import { cookies } from "next/headers";
import { actionFail, actionOk, type ActionResult } from "@/lib/actionResult";
import { normalizeName } from "@/lib/profile/normalizeName";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import type { LocalProfile } from "@/lib/profile/profileTypes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

async function setProfileCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PROFILE_COOKIE_NAME, userId, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
}

export async function findOrCreateProfile(
  rawName: string,
): Promise<ActionResult<LocalProfile>> {
  try {
    const trimmed = rawName.trim();

    if (!trimmed) {
      return actionFail("PROFILE_NAME_REQUIRED");
    }

    const normalizedName = normalizeName(trimmed);
    const supabase = createServerSupabaseClient();

    // Use the find_or_create_user RPC which works with any schema state
    // and generates the UUID server-side via SECURITY DEFINER.
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "find_or_create_user",
      { p_name: trimmed, p_normalized_name: normalizedName },
    );

    if (rpcError) {
      // RPC doesn't exist yet (migration not run) — fall back to direct queries
      return await findOrCreateDirect(supabase, trimmed, normalizedName);
    }

    const user = rpcResult as { id: string; name: string } | null;

    if (!user?.id) {
      return actionFail("PROFILE_RPC_EMPTY");
    }

    const profile: LocalProfile = { id: user.id, name: user.name };
    await setProfileCookie(profile.id);
    return actionOk(profile);
  } catch (err) {
    const code = err instanceof Error ? err.message : "PROFILE_UNEXPECTED_ERROR";
    return actionFail(code);
  }
}

/** Fallback when the find_or_create_user RPC has not been deployed yet. */
async function findOrCreateDirect(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createServerSupabaseClient>,
  name: string,
  normalizedName: string,
): Promise<ActionResult<LocalProfile>> {
  // Try to find by normalized_name (requires add-profile-fields migration)
  const { data: existing, error: findError } = await supabase
    .from("users")
    .select("id, name")
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (!findError && existing) {
    await supabase
      .from("users")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existing.id);

    const profile: LocalProfile = { id: existing.id, name: existing.name };
    await setProfileCookie(profile.id);
    return actionOk(profile);
  }

  // Create — always supply an explicit id so the action works on schemas
  // that were created before gen_random_uuid() was set as the column default.
  const insertPayload: Record<string, string> = {
    id: crypto.randomUUID(),
    name,
  };

  // Only include normalized_name if the column likely exists (find didn't
  // error due to missing column, just returned no rows).
  if (!findError) {
    insertPayload.normalized_name = normalizedName;
  }

  const { data: created, error: createError } = await supabase
    .from("users")
    .insert(insertPayload)
    .select("id, name")
    .single();

  if (createError || !created) {
    return actionFail(
      `PROFILE_INSERT_FAILED:${createError?.message ?? "no data"}`,
    );
  }

  const profile: LocalProfile = { id: created.id, name: created.name };
  await setProfileCookie(profile.id);
  return actionOk(profile);
}

export async function updateProfileLastSeen(userId: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase
      .from("users")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", userId);
  } catch {
    // Non-critical — ignore
  }
}
