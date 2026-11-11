import { createHash, randomBytes } from "crypto";

/**
 * Possession token for a profile. The app has no login; instead, the server
 * issues a random secret the first time a device uses an unclaimed profile,
 * stores only its hash, and requires the raw token (httpOnly cookie) for
 * every mutation. Whoever holds the token owns the profile.
 */
export const PROFILE_TOKEN_COOKIE = "gsi_profile_token";

export const PROFILE_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function generateProfileToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashProfileToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
