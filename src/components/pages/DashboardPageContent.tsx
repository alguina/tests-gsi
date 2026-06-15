"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableWrap,
} from "@/components/ui/Table";
import { useI18n } from "@/lib/i18n/useI18n";
import type { RecommendationReason } from "@/lib/recommendations/types";
import { formatScore } from "@/lib/stats/formatScore";
import type { DashboardStudyMetrics } from "@/lib/studyMetrics";
import { formatTopicDisplayLabel } from "@/lib/topics/formatTopicDisplay";
import { cn } from "@/lib/ui/cn";

type DashboardPageContentProps = {
  metrics: DashboardStudyMetrics;
};

function formatTopicLabel(
  t: (key: string, params?: Record<string, string | number>) => string,
  topic: string,
  topicTitle: string | null,
): string {
  const label = formatTopicDisplayLabel({ topic, topicTitle });
  return label || t("topics.noTopic");
}

function Sparkline({
  values,
  className,
}: {
  values: Array<number | null>;
  className?: string;
}) {
  const numeric = values.filter((value): value is number => value !== null);

  if (numeric.length < 2) {
    return null;
  }

  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const points = numeric
    .map((value, index) => {
      const x = (index / (numeric.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-8 w-28 text-brand", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

export function DashboardPageContent({ metrics }: DashboardPageContentProps) {
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
          label={t("dashboard.completedSessions")}
          value={metrics.completedSessions}
        />
        <StatCard
          label={t("dashboard.totalAnswered")}
          value={metrics.totalAnsweredQuestions}
        />
        <StatCard
          label={t("dashboard.uniqueSeen")}
          value={metrics.uniqueQuestionsSeen}
        />
        <StatCard
          label={t("dashboard.globalAccuracy")}
          value={
            metrics.globalAccuracy === null
              ? t("common.dash")
              : `${metrics.globalAccuracy}%`
          }
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.correctTotal")}
          value={metrics.correctTotal}
        />
        <StatCard label={t("dashboard.wrongTotal")} value={metrics.wrongTotal} />
        <StatCard label={t("dashboard.blankTotal")} value={metrics.blankTotal} />
        <StatCard
          label={t("dashboard.averageNetScore")}
          value={
            metrics.averageNetScore === null
              ? t("common.dash")
              : formatScore(metrics.averageNetScore)
          }
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.normalizedPer100")}
          value={
            metrics.normalizedNetScorePer100 === null
              ? t("common.dash")
              : formatScore(metrics.normalizedNetScorePer100)
          }
        />
        <StatCard
          label={t("dashboard.failedTwice")}
          value={metrics.failedAtLeastTwice}
        />
        <StatCard
          label={t("dashboard.unseenQuestions")}
          value={metrics.unseenQuestions}
        />
        <StatCard
          label={t("dashboard.bookmarkedQuestions")}
          value={metrics.bookmarkedQuestions}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("dashboard.currentStreak")}
          value={t("dashboard.streakDays", { count: metrics.currentStreakDays })}
        />
        <StatCard
          label={t("dashboard.activity7Days")}
          value={metrics.activityLast7Days}
        />
        <StatCard
          label={t("dashboard.activity30Days")}
          value={metrics.activityLast30Days}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card as="article">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {t("dashboard.performanceOverTime")}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t("dashboard.trainingOnlyTrend")}
              </p>
            </div>
            <Sparkline
              values={metrics.performanceTrend.map(
                (point) => point.normalizedNetScore,
              )}
            />
          </div>
          {metrics.performanceTrend.length ? (
            <TableWrap className="mt-4">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>{t("dashboard.date")}</TableCell>
                    <TableCell header>{t("dashboard.sessions")}</TableCell>
                    <TableCell header>{t("dashboard.globalAccuracy")}</TableCell>
                    <TableCell header>{t("dashboard.normalizedPer100")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.performanceTrend.map((point) => (
                    <TableRow key={point.date}>
                      <TableCell>{point.date}</TableCell>
                      <TableCell>{point.sessionCount}</TableCell>
                      <TableCell>
                        {point.accuracy === null
                          ? t("common.dash")
                          : `${point.accuracy}%`}
                      </TableCell>
                      <TableCell>
                        {point.normalizedNetScore === null
                          ? t("common.dash")
                          : formatScore(point.normalizedNetScore)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">
              {t("dashboard.noTrendYet")}
            </p>
          )}
        </Card>

        <Card as="article">
          <h2 className="text-lg font-semibold text-text-primary">
            {t("dashboard.mostFailedTopics")}
          </h2>
          {metrics.mostFailedTopics.length ? (
            <ul className="mt-3 space-y-2">
              {metrics.mostFailedTopics.map((item) => (
                <li
                  key={item.topic}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2"
                >
                  <Link
                    href={`/test?mode=topic&topic=${encodeURIComponent(item.topic)}&count=25&filter=failed`}
                    className="text-sm text-text-primary hover:underline"
                  >
                    {formatTopicLabel(t, item.topic, item.topicTitle)}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold text-text-primary">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">
              {t("dashboard.noFailedTopicsYet")}
            </p>
          )}
        </Card>
      </section>

      <Card as="section">
        <h2 className="text-lg font-semibold text-text-primary">
          {t("dashboard.topicPerformance")}
        </h2>
        {metrics.topicPerformance.length ? (
          <TableWrap className="mt-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>{t("reviewTopics.topic")}</TableCell>
                  <TableCell header>{t("dashboard.available")}</TableCell>
                  <TableCell header>{t("dashboard.uniqueSeen")}</TableCell>
                  <TableCell header>{t("dashboard.attempts")}</TableCell>
                  <TableCell header>{t("test.correct")}</TableCell>
                  <TableCell header>{t("test.wrong")}</TableCell>
                  <TableCell header>{t("test.blank")}</TableCell>
                  <TableCell header>{t("reviewTopics.accuracy")}</TableCell>
                  <TableCell header>{t("dashboard.errorRate")}</TableCell>
                  <TableCell header>{t("dashboard.lastAttempt")}</TableCell>
                  <TableCell header>{t("dashboard.priority")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.topicPerformance.map((topic) => (
                  <TableRow key={topic.topic}>
                    <TableCell>
                      <Link
                        href={`/test?mode=topic&topic=${encodeURIComponent(topic.topic)}&count=25`}
                        className="hover:underline"
                      >
                        {formatTopicLabel(t, topic.topic, topic.topicTitle)}
                      </Link>
                    </TableCell>
                    <TableCell>{topic.availableQuestions}</TableCell>
                    <TableCell>{topic.uniqueSeen}</TableCell>
                    <TableCell>{topic.totalAttempts}</TableCell>
                    <TableCell>{topic.correct}</TableCell>
                    <TableCell>{topic.wrong}</TableCell>
                    <TableCell>{topic.blank}</TableCell>
                    <TableCell>
                      {topic.accuracy === null
                        ? t("common.dash")
                        : `${topic.accuracy}%`}
                    </TableCell>
                    <TableCell>
                      {topic.errorRate === null
                        ? t("common.dash")
                        : `${topic.errorRate}%`}
                    </TableCell>
                    <TableCell>
                      {topic.lastAttemptedAt
                        ? new Date(topic.lastAttemptedAt).toLocaleDateString()
                        : t("common.dash")}
                    </TableCell>
                    <TableCell>{topic.priorityScore.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        ) : (
          <p className="mt-4 text-sm text-text-secondary">
            {t("dashboard.noTopicsYet")}
          </p>
        )}
      </Card>

      {!metrics.totalAnsweredQuestions ? (
        <EmptyState
          title={t("dashboard.noAttemptHistory")}
          description={t("dashboard.noAttemptHistoryDescription")}
          action={<Button href="/train">{t("training.start")}</Button>}
        />
      ) : null}
    </PageContainer>
  );
}
