import type { LocalProfile } from "@/lib/profile/profileTypes";

export const PROFILE_ID_KEY = "gsi_current_user_id";
export const PROFILE_NAME_KEY = "gsi_current_user_name";
export const PROFILE_COOKIE_NAME = "gsi_user_id";

// ---------------------------------------------------------------------------
// Module-level store (mirrors the pattern used in localeStore.ts)
// ---------------------------------------------------------------------------

let _profile: LocalProfile | null = null;
const _listeners = new Set<() => void>();

function _emit(): void {
  _listeners.forEach((fn) => fn());
}

// Read from localStorage immediately when this module loads on the client.
if (typeof window !== "undefined") {
  const id = window.localStorage.getItem(PROFILE_ID_KEY);
  const name = window.localStorage.getItem(PROFILE_NAME_KEY);
  if (id && name) {
    _profile = { id, name };
  }
}

export function subscribeToProfile(listener: () => void): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

/** Client-side snapshot — returns value already loaded from localStorage. */
export function getProfileSnapshot(): LocalProfile | null {
  return _profile;
}

/** Server-side snapshot — always null (no localStorage on server). */
export function getServerProfileSnapshot(): LocalProfile | null {
  return null;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function readProfileFromStorage(): LocalProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const id = window.localStorage.getItem(PROFILE_ID_KEY);
  const name = window.localStorage.getItem(PROFILE_NAME_KEY);

  return id && name ? { id, name } : null;
}

export function writeProfileToStorage(profile: LocalProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_ID_KEY, profile.id);
  window.localStorage.setItem(PROFILE_NAME_KEY, profile.name);

  // Set a plain cookie so server components can read the user id per-request.
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${PROFILE_COOKIE_NAME}=${profile.id}; path=/; max-age=${maxAge}; samesite=lax`;

  _profile = profile;
  _emit();
}

export function clearProfileFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PROFILE_ID_KEY);
  window.localStorage.removeItem(PROFILE_NAME_KEY);

  document.cookie = `${PROFILE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;

  _profile = null;
  _emit();
}
