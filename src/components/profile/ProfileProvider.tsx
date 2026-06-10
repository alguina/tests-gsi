"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearProfileFromStorage,
  getProfileSnapshot,
  getServerProfileSnapshot,
  subscribeToProfile,
  writeProfileToStorage,
} from "@/lib/profile/profileStore";
import type { LocalProfile } from "@/lib/profile/profileTypes";
import { ChooseProfileModal } from "@/components/profile/ChooseProfileModal";

type ProfileContextValue = {
  profile: LocalProfile | null;
  isHydrated: boolean;
  saveProfile: (profile: LocalProfile) => void;
  clearProfile: () => void;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);

  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return ctx;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore uses getServerProfileSnapshot() (null) for SSR
  // and getProfileSnapshot() (from localStorage) on the client.
  // React handles the hydration boundary — no setState in effects needed.
  const profile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  // The server snapshot is always null, so after hydration React will
  // re-render once with the real client value. Use the client getter to
  // determine whether we're in a hydrated state (server and client agree
  // only when they both return the same reference, which never happens
  // for localStorage — so we treat "is browser" as the hydration flag).
  const isHydrated = typeof window !== "undefined";

  const saveProfile = useCallback((next: LocalProfile) => {
    writeProfileToStorage(next);
  }, []);

  const clearProfile = useCallback(() => {
    clearProfileFromStorage();
  }, []);

  const showModal = isHydrated && !profile;

  return (
    <ProfileContext.Provider
      value={{ profile, isHydrated, saveProfile, clearProfile }}
    >
      {children}
      {showModal && <ChooseProfileModal onProfileSelected={saveProfile} />}
    </ProfileContext.Provider>
  );
}
