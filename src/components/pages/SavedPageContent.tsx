"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
import type { getDatabaseStats } from "@/lib/databaseStats";

type SavedPageContentProps = {
  stats: Awaited<ReturnType<typeof getDatabaseStats>> | null;
  loadFailed: boolean;
};

export function SavedPageContent({ stats, loadFailed }: SavedPageContentProps) {
  const { t } = useI18n();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("saved.eyebrow")}
        title={t("saved.title")}
        description={t("saved.description")}
      />

      {loadFailed ? (
        <Card tone="danger">{t("saved.loadError")}</Card>
      ) : stats ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label={t("saved.sources")} value={stats.sourcesCount} />
          <StatCard label={t("saved.questions")} value={stats.questionsCount} />
          <StatCard label={t("saved.answers")} value={stats.answersCount} />
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/train">{t("training.start")}</Button>
        <Button href="/import" variant="secondary">
          {t("saved.backToImport")}
        </Button>
      </div>
    </PageContainer>
  );
}
