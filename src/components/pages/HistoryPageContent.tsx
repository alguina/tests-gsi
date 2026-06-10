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
                    {session.title ??
                      t("history.questionSession", {
                        count: session.totalQuestions,
                      })}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {session.completedAt
                      ? formatDate(session.completedAt)
                      : t("history.inProgress")}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">
                    {t("history.mode", { mode: session.mode })}
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
              <Button
                href={`/test/session/${session.id}`}
                variant="secondary"
                className="mt-4"
              >
                {t("history.viewResults")}
              </Button>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          title={t("history.empty")}
          description={t("history.noSessionsDescription")}
          action={<Button href="/take-test">{t("home.startTraining")}</Button>}
        />
      )}
    </PageContainer>
  );
}
