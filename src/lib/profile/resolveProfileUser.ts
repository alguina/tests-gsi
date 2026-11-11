
import { cookies } from "next/headers";

import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import {
  PROFILE_TOKEN_COOKIE,
  PROFILE_TOKEN_COOKIE_MAX_AGE,
  generateProfileToken,
  hashProfileToken,
} from "@/lib/profile/profileToken";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Supabase = ReturnType<typeof createServerSupabaseClient>;

async function setProfileCookies(userId: string, token: string): Promise<void> {
  const cookieStore = await cookies();
  const base = {
    path: "/",
    maxAge: PROFILE_TOKEN_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
  cookieStore.set(PROFILE_TOKEN_COOKIE, token, { ...base, httpOnly: true });
  cookieStore.set(PROFILE_COOKIE_NAME, userId, { ...base, httpOnly: false });
}

/**
 * Claims an unclaimed legacy profile for this device: issues a fresh token,
 * stores its hash and sets the cookies. Fails when the profile already
 * belongs to another device (first device to use it wins; profiles are
 * casual identities, not accounts).
 */
async function claimProfile(supabase: Supabase, userId: string): Promise<string> {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, profile_token_hash")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user || user.profile_token_hash) {
    throw new Error("PROFILE_TOKEN_REQUIRED");
  }

  const token = generateProfileToken();
  const { error: claimError } = await supabase
    .from("users")
    .update({ profile_token_hash: hashProfileToken(token) })
    .eq("id", userId)
    .is("profile_token_hash", null);

  if (claimError) {
    throw new Error("PROFILE_TOKEN_REQUIRED");
  }

  await setProfileCookies(userId, token);
  return userId;
}

/**
 * Resolves the profile allowed to mutate data in this request.
 *
 * Priority: a valid possession-token cookie wins and the client-supplied id
 * is ignored. Without one, the requested (or default) profile is claimed if
 * it is still unclaimed; otherwise the caller must go through profile
 * selection again. Throws PROFILE_TOKEN_REQUIRED when neither applies.
 */
export async function requireProfileUserId(clientUserId?: string): Promise<string> {
  const supabase = createServerSupabaseClient();
  const cookieStore = await cookies();

  const token = cookieStore.get(PROFILE_TOKEN_COOKIE)?.value;
  if (token) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("profile_token_hash", hashProfileToken(token))
      .maybeSingle();
    if (user) {
      return user.id;
    }
  }

  const candidate =
    clientUserId ?? cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
  return claimProfile(supabase, candidate);
}

/**
 * Issues a token for a profile that was just found or created by name.
 * Returns true when this device now owns the profile; false when another
 * device already claimed it.
 */
export async function claimProfileAfterLookup(userId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const cookieStore = await cookies();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, profile_token_hash")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user) {
    return false;
  }

  if (!user.profile_token_hash) {
    const token = generateProfileToken();
    const { error: claimError } = await supabase
      .from("users")
      .update({ profile_token_hash: hashProfileToken(token) })
      .eq("id", userId)
      .is("profile_token_hash", null);
    if (claimError) {
      return false;
    }
    await setProfileCookies(userId, token);
    return true;
  }

  const token = cookieStore.get(PROFILE_TOKEN_COOKIE)?.value;
  return Boolean(token && hashProfileToken(token) === user.profile_token_hash);
}
