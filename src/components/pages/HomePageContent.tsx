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
import type { getHomeStudyStats } from "@/lib/studyMetrics";

type HomePageContentProps = {
  stats: Awaited<ReturnType<typeof getHomeStudyStats>>;
};

export function HomePageContent({ stats }: HomePageContentProps) {
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
            <Button href={`/test?resume=${stats.inProgressSession.id}`}>
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
          failedQuestionsAvailable={stats.failedQuestionsAvailable}
        />
        <LatestSessionCard latestSession={stats.latestSession} />
      </section>
    </PageContainer>
  );
}

function RecommendedCard({
  hasAttempts,
  failedQuestionsAvailable,
}: {
  hasAttempts: boolean;
  failedQuestionsAvailable: number;
}) {
  const { t } = useI18n();

  return (
    <Card as="article">
      <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {t("home.recommendedToday")}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-text-primary">
        {hasAttempts
          ? t("home.reviewRecentMistakes")
          : t("home.startWithRandomTest")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {hasAttempts
          ? t("home.recommendedWithAttempts")
          : t("home.recommendedWithoutAttempts")}
      </p>
      <div className="mt-4 rounded-xl bg-surface-muted p-3 text-sm text-text-primary">
        {hasAttempts
          ? t("home.suggestedTopicsWeak")
          : t("home.suggestedTopicsMixed")}
      </div>
      {failedQuestionsAvailable > 0 ? (
        <Button href="/take-test" variant="secondary" className="mt-4">
          {t("home.reviewMistakesCta")}
        </Button>
      ) : null}
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
