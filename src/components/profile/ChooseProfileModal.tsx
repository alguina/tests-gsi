"use client";

import { useState, type FormEvent } from "react";
import { findOrCreateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/useI18n";
import type { LocalProfile } from "@/lib/profile/profileTypes";

type ChooseProfileModalProps = {
  onProfileSelected: (profile: LocalProfile) => void;
};

export function ChooseProfileModal({
  onProfileSelected,
}: ChooseProfileModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError(t("profile.validationNameRequired"));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await findOrCreateProfile(name);

      if (!result.ok) {
        setError(
          result.code === "PROFILE_NAME_REQUIRED"
            ? t("profile.validationNameRequired")
            : `Error: ${result.code}`,
        );
        return;
      }

      onProfileSelected(result.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="choose-profile-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-[0_12px_40px_rgb(26_26_26_/_0.12)]">
        <h1
          id="choose-profile-title"
          className="text-xl font-medium tracking-tight text-text-primary"
        >
          {t("profile.chooseTitle")}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {t("profile.chooseDescription")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="profile-name">
              {t("profile.nameLabel")}
            </FieldLabel>
            <Input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.namePlaceholder")}
              autoFocus
              autoComplete="name"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? "…" : t("profile.start")}
          </Button>
        </form>
      </div>
    </div>
  );
}
