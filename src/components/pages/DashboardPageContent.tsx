"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
import { formatScore } from "@/lib/stats/formatScore";
import type { getHomeStudyStats } from "@/lib/studyMetrics";

const PLACEHOLDER_KEYS = [
  "dashboard.performanceOverTime",
  "dashboard.accuracyByTopic",
  "dashboard.netScoreTrend",
  "dashboard.mostFailedTopics",
  "dashboard.mostImprovedTopics",
] as const;

type DashboardPageContentProps = {
  stats: Awaited<ReturnType<typeof getHomeStudyStats>>;
};

export function DashboardPageContent({ stats }: DashboardPageContentProps) {
  const { t } = useI18n();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("home.totalQuestions")} value={stats.totalQuestionsImported} />
        <StatCard label={t("home.totalTests")} value={stats.totalSourcesImported} />
        <StatCard label={t("home.questionsAnswered")} value={stats.totalQuestionsAnswered} />
        <StatCard
          label={t("home.averageNetScore")}
          value={
            stats.averageNetScore === null
              ? t("common.dash")
              : formatScore(stats.averageNetScore)
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {PLACEHOLDER_KEYS.map((key) => (
          <Card key={key} as="article">
            <h2 className="text-lg font-semibold text-text-primary">{t(key)}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {t("dashboard.placeholderDescription")}
            </p>
          </Card>
        ))}
      </section>

      {!stats.totalQuestionsAnswered ? (
        <EmptyState
          title={t("dashboard.noAttemptHistory")}
          description={t("dashboard.noAttemptHistoryDescription")}
          action={<Button href="/take-test">{t("home.startTraining")}</Button>}
        />
      ) : null}
    </PageContainer>
  );
}
