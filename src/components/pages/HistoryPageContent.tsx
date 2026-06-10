"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n, useLocaleDateFormatter } from "@/lib/i18n/useI18n";
import { formatScore } from "@/lib/stats/formatScore";
import type { getRecentSessions } from "@/lib/studyMetrics";

type HistoryPageContentProps = {
  sessions: Awaited<ReturnType<typeof getRecentSessions>>;
};

export function HistoryPageContent({ sessions }: HistoryPageContentProps) {
  const { t } = useI18n();
  const formatDate = useLocaleDateFormatter();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("history.eyebrow")}
        title={t("history.title")}
        description={t("history.description")}
      />

      {sessions.length ? (
        <section className="grid gap-3">
          {sessions.map((session) => (
            <Card key={session.id} as="article">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary">
                    {t("history.questionSession", {
                      count: session.totalQuestions,
                    })}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {session.finishedAt
                      ? formatDate(session.finishedAt)
                      : t("history.inProgress")}
                  </p>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {t("history.netScore", {
                    score: formatScore(session.netScore),
                  })}
                </p>
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                {t("history.sessionSummary", {
                  correct: session.correctCount,
                  wrong: session.wrongCount,
                  blank: session.blankCount,
                })}
              </p>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          title={t("history.noSessionsYet")}
          description={t("history.noSessionsDescription")}
          action={<Button href="/take-test">{t("home.startTraining")}</Button>}
        />
      )}
    </PageContainer>
  );
}
