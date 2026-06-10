"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
import { formatScore } from "@/lib/stats/formatScore";
import type { getDashboardStats, getHomeStudyStats } from "@/lib/studyMetrics";

const PLACEHOLDER_KEYS = [
  "dashboard.performanceOverTime",
  "dashboard.accuracyByTopic",
  "dashboard.netScoreTrend",
  "dashboard.mostImprovedTopics",
] as const;

type DashboardPageContentProps = {
  stats: Awaited<ReturnType<typeof getHomeStudyStats>>;
  dashboardStats: Awaited<ReturnType<typeof getDashboardStats>>;
};

export function DashboardPageContent({
  stats,
  dashboardStats,
}: DashboardPageContentProps) {
  const { t } = useI18n();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.totalSessions")}
          value={dashboardStats.totalSessions}
        />
        <StatCard
          label={t("dashboard.totalAnswered")}
          value={dashboardStats.totalQuestionsAnswered}
        />
        <StatCard
          label={t("dashboard.globalAccuracy")}
          value={
            dashboardStats.globalAccuracy === null
              ? t("common.dash")
              : `${dashboardStats.globalAccuracy}%`
          }
        />
        <StatCard
          label={t("dashboard.averageNetScore")}
          value={
            dashboardStats.averageNetScore === null
              ? t("common.dash")
              : formatScore(dashboardStats.averageNetScore)
          }
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("home.totalQuestions")} value={stats.totalQuestionsImported} />
        <StatCard label={t("home.totalTests")} value={stats.totalSourcesImported} />
        <StatCard
          label={t("home.averageNetScore")}
          value={
            stats.averageNetScore === null
              ? t("common.dash")
              : formatScore(stats.averageNetScore)
          }
        />
        <StatCard
          label={t("home.pendingReview")}
          value={stats.pendingReviewQuestions}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card as="article">
          <h2 className="text-lg font-semibold text-text-primary">
            {t("dashboard.mostFailedTopics")}
          </h2>
          {dashboardStats.mostFailedTopics.length ? (
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              {dashboardStats.mostFailedTopics.map((item) => (
                <li
                  key={item.topic}
                  className="flex items-center justify-between gap-3"
                >
                  <span>
                    {item.topicTitle
                      ? t("dashboard.failedTopicWithTitle", {
                          topic: item.topic,
                          title: item.topicTitle,
                        })
                      : item.topic}
                  </span>
                  <span className="shrink-0 font-semibold text-text-primary">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {t("dashboard.noFailedTopicsYet")}
            </p>
          )}
        </Card>

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
