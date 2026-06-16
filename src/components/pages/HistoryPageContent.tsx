"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n, useLocaleDateFormatter } from "@/lib/i18n/useI18n";
import { formatScore } from "@/lib/stats/formatScore";
import { normalizeNetScoreTo100 } from "@/lib/stats/userMetrics";
import type { LatestSession } from "@/lib/studyMetrics";

type HistoryPageContentProps = {
  sessions: LatestSession[];
  page: number;
  pageSize: number;
  total: number;
};

export function HistoryPageContent({
  sessions,
  page,
  pageSize,
  total,
}: HistoryPageContentProps) {
  const { t } = useI18n();
  const formatDate = useLocaleDateFormatter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("history.eyebrow")}
        title={t("history.title")}
        description={t("history.description")}
        actions={
          <Button href="/export" variant="secondary">
            {t("export.openExport")}
          </Button>
        }
      />

      {sessions.length ? (
        <>
          <section className="grid gap-3">
            {sessions.map((session) => {
              const gradeOver100 = normalizeNetScoreTo100(
                session.netScore,
                session.correctCount + session.wrongCount,
              );

              return (
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
                  <div className="text-left sm:text-right">
                    <p className="text-base font-medium tabular-nums tracking-tight text-text-primary">
                      {t("history.netScore", {
                        score: formatScore(session.netScore),
                      })}
                    </p>
                    {gradeOver100 !== null ? (
                      <p className="mt-0.5 text-xs tabular-nums text-text-muted">
                        {t("test.gradeOver100")}: {formatScore(gradeOver100)}
                      </p>
                    ) : null}
                  </div>
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
              );
            })}
          </section>

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              {t("history.pagination", { page, totalPages, total })}
            </p>
            <div className="flex gap-2">
              <Button
                href={page > 1 ? `/history?page=${page - 1}` : undefined}
                variant="secondary"
                disabled={page <= 1}
              >
                {t("history.previousPage")}
              </Button>
              <Button
                href={
                  page < totalPages ? `/history?page=${page + 1}` : undefined
                }
                variant="secondary"
                disabled={page >= totalPages}
              >
                {t("history.nextPage")}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title={t("history.empty")}
          description={t("history.noSessionsDescription")}
          action={<Button href="/train">{t("training.start")}</Button>}
        />
      )}
    </PageContainer>
  );
}
