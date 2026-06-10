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
  const trimmed = rawName.trim();

  if (!trimmed) {
    return actionFail("PROFILE_NAME_REQUIRED");
  }

  const normalizedName = normalizeName(trimmed);
  const supabase = createServerSupabaseClient();

  // Try to find an existing user with the same normalized name
  const { data: existing, error: findError } = await supabase
    .from("users")
    .select("id, name")
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (findError) {
    return actionFail("PROFILE_FIND_FAILED");
  }

  if (existing) {
    const profile: LocalProfile = { id: existing.id, name: existing.name };

    await supabase
      .from("users")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existing.id);

    await setProfileCookie(profile.id);

    return actionOk(profile);
  }

  // Create a new user
  const { data: created, error: createError } = await supabase
    .from("users")
    .insert({ name: trimmed, normalized_name: normalizedName })
    .select("id, name")
    .single();

  if (createError || !created) {
    return actionFail("PROFILE_CREATE_FAILED");
  }

  const profile: LocalProfile = { id: created.id, name: created.name };

  await setProfileCookie(profile.id);

  return actionOk(profile);
}

export async function updateProfileLastSeen(userId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  await supabase
    .from("users")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", userId);
}
