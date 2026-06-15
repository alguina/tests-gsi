"use client";

import Link from "next/link";
import { SectionHubPageContent } from "@/components/pages/SectionHubPageContent";
import { useProfile } from "@/components/profile/ProfileProvider";
import { Card } from "@/components/ui/Card";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import { MORE_SECTION_LINKS } from "@/lib/navigation";

export function MorePageContent() {
  const { t } = useI18n();
  const { profile, isHydrated, clearProfile } = useProfile();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("moreSection.eyebrow")}
        title={t("nav.more")}
        description={t("moreSection.description")}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {MORE_SECTION_LINKS.filter((link) => link.href !== "/more#profile").map(
          (link) => (
            <Card key={link.href} as="article">
              <h2 className="text-base font-medium tracking-tight text-text-primary">
                <Link href={link.href} className="hover:text-selection-from">
                  {t(link.labelKey)}
                </Link>
              </h2>
              {link.descriptionKey ? (
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {t(link.descriptionKey)}
                </p>
              ) : null}
            </Card>
          ),
        )}
      </section>

      <section id="profile">
      <Card as="section" className="mt-6">
        <h2 className="text-base font-medium tracking-tight text-text-primary">
          {t("nav.profile")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t("moreSection.profileDescription")}
        </p>
        {isHydrated && profile ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-text-primary">
              {profile.name}
            </span>
            <button
              type="button"
              onClick={clearProfile}
              className="text-sm text-text-secondary underline underline-offset-2 hover:text-selection-from"
            >
              {t("profile.changeProfile")}
            </button>
          </div>
        ) : null}
      </Card>
      </section>

      <Card as="section" className="mt-6">
        <h2 className="text-base font-medium tracking-tight text-text-primary">
          {t("nav.settings")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t("moreSection.settingsDescription")}
        </p>
        <div className="mt-4">
          <LanguageSelector />
        </div>
      </Card>
    </PageContainer>
  );
}
