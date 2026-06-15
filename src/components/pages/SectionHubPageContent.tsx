"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import type { NavLinkItem } from "@/lib/navigation";

type SectionHubPageContentProps = {
  eyebrowKey: string;
  titleKey: string;
  descriptionKey: string;
  links: NavLinkItem[];
};

export function SectionHubPageContent({
  eyebrowKey,
  titleKey,
  descriptionKey,
  links,
}: SectionHubPageContentProps) {
  const { t } = useI18n();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t(eyebrowKey)}
        title={t(titleKey)}
        description={t(descriptionKey)}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Card key={link.href} as="article">
            <h2 className="text-lg font-semibold text-text-primary">
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
        ))}
      </section>
    </PageContainer>
  );
}
