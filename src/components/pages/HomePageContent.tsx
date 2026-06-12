"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { discardTest } from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
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
  TEST_MODE_EXAM,
  type InProgressSession,
} from "@/lib/testSession";

type HomePageContentProps = {
  stats: Awaited<ReturnType<typeof getHomeStudyStats>>;
  recommendation: StudyRecommendation | null;
};

export function HomePageContent({ stats, recommendation }: HomePageContentProps) {
  const { t } = useI18n();
  const { profile } = useProfile();

  const heroTitle = profile?.name
    ? t("home.greeting", { name: profile.name })
    : t("home.eyebrow");

  return (
    <PageContainer>
      <PageHeader
        variant="hero"
        eyebrow={t("home.eyebrow")}
        title={heroTitle}
        description={t("home.description")}
        actions={
          <Button href="/take-test" fullWidth className="sm:w-auto">
            {t("home.startTraining")}
          </Button>
        }
      />

      {stats.inProgressSession ? (
        <Card tone="warning" as="section">
          <h2 className="text-lg font-semibold text-text-primary">
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

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
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
        <StatCard label={t("home.weakTopics")} value={stats.weakTopicsCount} />
        <StatCard label={t("home.pendingReview")} value={stats.pendingReviewQuestions} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RecommendedCard
          hasAttempts={stats.totalQuestionsAnswered > 0}
          recommendation={recommendation}
        />
        <LatestSessionCard latestSession={stats.latestSession} />
      </section>
    </PageContainer>
  );
}

function RecommendedCard({
  hasAttempts,
  recommendation,
}: {
  hasAttempts: boolean;
  recommendation: StudyRecommendation | null;
}) {
  const { t } = useI18n();
  const suggestedCount = recommendation?.suggestedCount ?? RECOMMENDED_DEFAULT_COUNT;
  const topics = recommendation?.topics ?? [];
  const reasons = recommendation?.reasons ?? [];

  return (
    <Card as="article">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {t("home.recommendedToday")}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-text-primary">
        {hasAttempts
          ? t("takeTest.recommendedTraining")
          : t("home.startWithRandomTest")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {hasAttempts
          ? t("home.recommendedWithAttempts")
          : t("home.recommendedWithoutAttempts")}
      </p>
      {hasAttempts && recommendation ? (
        <>
          <div className="mt-4 space-y-2 rounded-xl bg-surface-muted p-3 text-sm text-text-primary">
            <p>
              {t("recommendation.suggestedSize", { count: suggestedCount })}
            </p>
            {topics.length ? (
              <p>
                {t("recommendation.selectedTopics", {
                  topics: topics
                    .map((topic) =>
                      topic.topicTitle
                        ? t("dashboard.failedTopicWithTitle", {
                            topic: topic.topic,
                            title: topic.topicTitle,
                          })
                        : topic.topic,
                    )
                    .join(", "),
                })}
              </p>
            ) : null}
            {reasons.map((reason) => (
              <p key={reason.code} className="text-text-secondary">
                {formatRecommendationReason(t, reason)}
              </p>
            ))}
          </div>
          <Button
            href={`/test?mode=recommended&count=${suggestedCount}`}
            className="mt-4"
          >
            {t("recommendation.startTraining")}
          </Button>
        </>
      ) : (
        <Button href="/take-test" className="mt-4">
          {t("home.startTraining")}
        </Button>
      )}
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

function LatestSessionCard({
  latestSession,
}: {
  latestSession: HomePageContentProps["stats"]["latestSession"];
}) {
  const { t } = useI18n();

  return (
    <Card as="article">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {t("home.latestSession")}
      </p>
      {latestSession ? (
        <>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">
            {t("home.netScore", { score: formatScore(latestSession.netScore) })}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {t("home.sessionSummary", {
              correct: latestSession.correctCount,
              wrong: latestSession.wrongCount,
              blank: latestSession.blankCount,
              total: latestSession.totalQuestions,
            })}
          </p>
          <Button href="/history" variant="link" className="mt-4 px-0">
            {t("home.viewHistory")}
          </Button>
        </>
      ) : (
        <>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">
            {t("home.noSessionsYet")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("home.noSessionsDescription")}
          </p>
        </>
      )}
    </Card>
  );
}
