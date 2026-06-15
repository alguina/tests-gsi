"use client";

import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableRow, TableWrap } from "@/components/ui/Table";
import { TestResultsContent } from "@/components/pages/TestResultsContent";
import { useI18n } from "@/lib/i18n/useI18n";
import { formatScore } from "@/lib/stats/formatScore";
import type { ExamTestResult } from "@/lib/testSession";

type ExamResultsContentProps = {
  result: ExamTestResult;
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) {
    return "—";
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function ExamResultsContent({ result }: ExamResultsContentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-text-muted">{t("exam.timeUsed")}</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {formatDuration(result.durationSeconds ?? null)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">{t("exam.timeLimit")}</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {result.timeLimitSeconds
              ? formatDuration(result.timeLimitSeconds)
              : t("common.dash")}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">{t("exam.normalizedScore")}</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {result.normalizedNetScore === null
              ? t("common.dash")
              : formatScore(result.normalizedNetScore)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">{t("test.netScore")}</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {formatScore(result.netScore)}
          </p>
        </Card>
      </section>

      {result.previousSimulations.length ? (
        <Card as="section">
          <h2 className="text-base font-medium tracking-tight text-text-primary">
            {t("exam.previousSimulations")}
          </h2>
          <TableWrap className="mt-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>{t("exam.completedAt")}</TableCell>
                  <TableCell header>{t("test.netScore")}</TableCell>
                  <TableCell header>{t("exam.normalizedScore")}</TableCell>
                  <TableCell header>{t("exam.timeUsed")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.previousSimulations.map((simulation) => (
                  <TableRow key={simulation.sessionId}>
                    <TableCell>
                      {new Date(simulation.completedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatScore(simulation.netScore)}</TableCell>
                    <TableCell>
                      {simulation.normalizedNetScore === null
                        ? t("common.dash")
                        : formatScore(simulation.normalizedNetScore)}
                    </TableCell>
                    <TableCell>
                      {formatDuration(simulation.durationSeconds)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </Card>
      ) : null}

      {result.topicBreakdown.length ? (
        <Card as="section">
          <h2 className="text-base font-medium tracking-tight text-text-primary">
            {t("exam.topicBreakdown")}
          </h2>
          <TableWrap className="mt-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>{t("reviewTopics.topic")}</TableCell>
                  <TableCell header>{t("test.correct")}</TableCell>
                  <TableCell header>{t("test.wrong")}</TableCell>
                  <TableCell header>{t("test.blank")}</TableCell>
                  <TableCell header>{t("reviewTopics.accuracy")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.topicBreakdown.map((topic) => (
                  <TableRow key={topic.topic}>
                    <TableCell>
                      {topic.topicTitle
                        ? t("dashboard.failedTopicWithTitle", {
                            topic: topic.topic,
                            title: topic.topicTitle,
                          })
                        : topic.topic}
                    </TableCell>
                    <TableCell>{topic.correct}</TableCell>
                    <TableCell>{topic.wrong}</TableCell>
                    <TableCell>{topic.blank}</TableCell>
                    <TableCell>
                      {topic.accuracy === null
                        ? t("common.dash")
                        : `${topic.accuracy}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </Card>
      ) : null}

      <TestResultsContent result={result} showSessionMeta={false} />
    </div>
  );
}
