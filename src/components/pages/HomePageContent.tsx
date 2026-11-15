"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { discardTest } from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import { HomeTrainingMenu } from "@/components/training/HomeTrainingMenu";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
import { formatScore } from "@/lib/stats/formatScore";
import { formatRecommendationReason } from "@/lib/recommendations/formatReasons";
import type { StudyRecommendation } from "@/lib/recommendations/types";
import { RECOMMENDED_DEFAULT_COUNT } from "@/lib/recommendations/constants";
import type { getHomeStudyStats } from "@/lib/studyMetrics";
import {
  formatTopicDisplayList,
} from "@/lib/topics/formatTopicDisplay";
import { TEST_MODE_EXAM } from "@/lib/testSession";
import { useStudyProgress } from "@/lib/useStudyProgress";

type HomePageContentProps = {
  stats: Awaited<ReturnType<typeof getHomeStudyStats>>;
  recommendation: StudyRecommendation | null;
};

function formatMetricValue(
  value: number | null,
  formatter: (value: number) => string,
  emptyLabel: string,
): string {
  if (value === null) {
    return emptyLabel;
  }

  return formatter(value);
}

export function HomePageContent({ stats, recommendation }: HomePageContentProps) {
  const { t } = useI18n();
  const { profile } = useProfile();
  const studyProgress = useStudyProgress(profile?.id);

  const heroTitle = profile?.name
    ? t("home.greeting", { name: profile.name })
    : t("home.eyebrow");

  const hasRecommendationData = stats.questionsAnswered > 0;
  const suggestedCount = recommendation?.suggestedCount ?? RECOMMENDED_DEFAULT_COUNT;
  const notEnoughData = t("home.notEnoughData");
  const studySummary = useMemo(() => {
    const entries = Object.entries(studyProgress);
    const completed = entries.filter(([, item]) => item.status === "completed").length;
    const lastTopic = entries.sort(([, left], [, right]) =>
      right.updatedAt.localeCompare(left.updatedAt),
    )[0]?.[0];
    return { completed, lastTopic };
  }, [studyProgress]);

  return (
    <PageContainer>
      <PageHeader
        variant="hero"
        eyebrow={t("home.eyebrow")}
        title={heroTitle}
        description={t("home.description")}
        className="overflow-visible"
        actions={<HomePrimaryActions
          studyCompleted={studySummary.completed}
          studyHref={studySummary.lastTopic ? `/study/${studySummary.lastTopic}` : "/study"}
          trainingSeen={stats.trainingQuestionsSeen}
          trainingAvailable={stats.trainingQuestionsAvailable}
        />}
      />

      {stats.inProgressSession ? (
        <Card tone="warning" as="section">
          <h2 className="text-base font-medium tracking-tight text-text-primary">
            {t("test.testInProgress")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {stats.inProgressSession.title ?? t("test.testInProgress")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              href={
                stats.inProgressSession.mode === TEST_MODE_EXAM
                  ? `/test/exam?resume=${stats.inProgressSession.id}`
                  : `/test?resume=${stats.inProgressSession.id}`
              }
            >
              {t("home.continueInProgressTest")}
            </Button>
            <DiscardInProgressButton sessionId={stats.inProgressSession.id} />
          </div>
        </Card>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={t("home.latestNetScore")}
          value={formatMetricValue(
            stats.latestNetScore,
            formatScore,
            notEnoughData,
          )}
        />
        <StatCard
          label={t("home.recentAverageNetScore")}
          value={formatMetricValue(
            stats.recentAverageNetScore,
            formatScore,
            notEnoughData,
          )}
        />
        <StatCard
          label={t("home.questionsAnswered")}
          value={stats.questionsAnswered}
        />
        <StatCard
          label={t("home.overallAccuracy")}
          value={
            stats.overallAccuracy === null
              ? notEnoughData
              : `${stats.overallAccuracy}%`
          }
        />
        <StatCard
          label={t("home.mistakesToReview")}
          value={stats.mistakesToReview}
        />
        <StatCard
          label={t("home.weakTopics")}
          value={
            stats.weakTopicsCount === null
              ? notEnoughData
              : stats.weakTopicsCount
          }
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RecommendedCard
          hasAttempts={hasRecommendationData}
          recommendation={recommendation}
          suggestedCount={suggestedCount}
        />
        <ProgressLinksCard />
      </section>
    </PageContainer>
  );
}

function HomePrimaryActions({
  studyCompleted,
  studyHref,
  trainingSeen,
  trainingAvailable,
}: {
  studyCompleted: number;
  studyHref: string;
  trainingSeen: number;
  trainingAvailable: number;
}) {
  const { t } = useI18n();
  const studyPercent = Math.round((studyCompleted / 57) * 100);
  const trainingPercent = trainingAvailable > 0
    ? Math.round((trainingSeen / trainingAvailable) * 100)
    : 0;

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <HomeActionCard
        title={t("home.studyAction")}
        progressLabel={t("home.studyProgressValue", { completed: studyCompleted, total: 57 })}
        percent={studyPercent}
        href={studyHref}
        actionLabel={t("home.startStudying")}
      />
      <HomeActionCard
        title={t("home.trainAction")}
        progressLabel={t("home.trainingProgressValue", { seen: trainingSeen, total: trainingAvailable })}
        percent={trainingPercent}
        href="/train"
        actionLabel={t("home.startStudying")}
      />
    </div>
  );
}

function HomeActionCard({
  title,
  progressLabel,
  percent,
  href,
  actionLabel,
}: {
  title: string;
  progressLabel: string;
  percent: number;
  href: string;
  actionLabel: string;
}) {
  const boundedPercent = Math.max(0, Math.min(100, percent));

  return (
    <Card as="article" padding="sm" className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <span className="text-xs font-medium tabular-nums text-text-muted">{boundedPercent}%</span>
      </div>
      <p className="mt-1 truncate text-xs text-text-secondary">{progressLabel}</p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={boundedPercent}
      >
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${boundedPercent}%` }} />
      </div>
      <Button href={href} size="sm" className="mt-3 w-full">
        {actionLabel}
      </Button>
    </Card>
  );
}

function RecommendedCard({
  hasAttempts,
  recommendation,
  suggestedCount,
}: {
  hasAttempts: boolean;
  recommendation: StudyRecommendation | null;
  suggestedCount: number;
}) {
  const { t } = useI18n();
  const topics = recommendation?.topics ?? [];
  const reasons = recommendation?.reasons ?? [];
  const primaryReason = reasons[0];
  const topicPreview = formatTopicDisplayList(
    topics.map((topic) => ({
      topic: topic.topic,
      topicTitle: topic.topicTitle,
    })),
  );

  return (
    <Card as="article">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {t("home.recommendedToday")}
      </p>
      <h2 className="mt-2 text-base font-medium tracking-tight text-text-primary">
        {hasAttempts
          ? t("home.recommendedSummary", { count: suggestedCount })
          : t("home.startWithRandomTest")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {hasAttempts
          ? t("home.recommendedWithAttempts")
          : t("home.recommendedWithoutAttempts")}
      </p>
      {hasAttempts && recommendation ? (
        <>
          <div className="mt-4 space-y-2 rounded-md bg-surface-muted p-3 text-sm text-text-primary">
            {!topicPreview.hasPoorLabels && topicPreview.visible.length ? (
              <p>
                {t("home.focus", {
                  topics: topicPreview.visible.join(", "),
                })}
                {topicPreview.remaining > 0
                  ? ` ${t("home.moreTopics", { count: topicPreview.remaining })}`
                  : ""}
              </p>
            ) : null}
            {primaryReason ? (
              <p className="text-text-secondary">
                {t("home.reason")}: {formatRecommendationReason(t, primaryReason)}
              </p>
            ) : null}
          </div>
          <Button
            href={`/test?mode=recommended&count=${suggestedCount}`}
            className="mt-4"
          >
            {t("training.startRecommended")}
          </Button>
        </>
      ) : (
        <HomeTrainingMenu className="mt-4" />
      )}
    </Card>
  );
}

function ProgressLinksCard() {
  const { t } = useI18n();

  return (
    <Card as="article">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {t("nav.progress")}
      </p>
      <h2 className="mt-2 text-base font-medium tracking-tight text-text-primary">
        {t("home.progressLinksTitle")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {t("home.progressLinksDescription")}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button href="/dashboard" variant="secondary">
          {t("nav.dashboard")}
        </Button>
        <Button href="/history" variant="secondary">
          {t("nav.history")}
        </Button>
        <Button href="/review-topics" variant="secondary">
          {t("nav.reviewTopics")}
        </Button>
      </div>
    </Card>
  );
}

function DiscardInProgressButton({ sessionId }: { sessionId: string }) {
  const { t } = useI18n();
  const { profile } = useProfile();
  const router = useRouter();
  const [isDiscarding, setIsDiscarding] = useState(false);

  async function handleDiscard() {
    setIsDiscarding(true);
    await discardTest(sessionId, profile?.id);
    router.refresh();
    setIsDiscarding(false);
  }

  return (
    <Button
      variant="secondary"
      onClick={() => void handleDiscard()}
      disabled={isDiscarding}
    >
      {t("home.discardInProgressTest")}
    </Button>
  );
}
