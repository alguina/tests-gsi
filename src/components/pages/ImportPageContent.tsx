"use client";

import { ImportPreview } from "@/components/ImportPreview";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";

export function ImportPageContent() {
  const { t } = useI18n();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("import.eyebrow")}
        title={t("import.title")}
        description={t("import.subtitle")}
      />
      <ImportPreview />
    </PageContainer>
  );
}
