"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SelectableOption } from "@/components/ui/SelectableOption";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableWrap,
} from "@/components/ui/Table";
import { useI18n } from "@/lib/i18n/useI18n";
import type { TopicQuestionFilter } from "@/lib/testDraft";
import type { getTopicSummaries } from "@/lib/studyMetrics";
import { TOPIC_QUESTION_COUNTS } from "@/lib/testSession";

type ReviewTopicsPageContentProps = {
  topics: Awaited<ReturnType<typeof getTopicSummaries>>;
};

export function ReviewTopicsPageContent({ topics }: ReviewTopicsPageContentProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | "all">(10);
  const [selectedFilter, setSelectedFilter] =
    useState<TopicQuestionFilter>("all");

  const activeTopic = topics.find((topic) => topic.topic === selectedTopic);

  function handleTrainTopic() {
    if (!selectedTopic) {
      return;
    }

    router.push(
      `/test?mode=topic&topic=${encodeURIComponent(selectedTopic)}&count=${selectedCount}&filter=${selectedFilter}`,
    );
  }

  return (
    <PageContainer width="full">
      <PageHeader
        eyebrow={t("reviewTopics.eyebrow")}
        title={t("reviewTopics.title")}
        description={t("reviewTopics.description")}
      />

      {topics.length ? (
        <>
          <Card padding="sm">
            <TableWrap>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell header>{t("reviewTopics.topic")}</TableCell>
                    <TableCell header>{t("reviewTopics.topicTitle")}</TableCell>
                    <TableCell header>
                      {t("reviewTopics.totalQuestions")}
                    </TableCell>
                    <TableCell header>{t("reviewTopics.answered")}</TableCell>
                    <TableCell header>{t("reviewTopics.correct")}</TableCell>
                    <TableCell header>{t("reviewTopics.wrong")}</TableCell>
                    <TableCell header>{t("reviewTopics.blankCount")}</TableCell>
                    <TableCell header>{t("reviewTopics.failedCount")}</TableCell>
                    <TableCell header>{t("reviewTopics.accuracy")}</TableCell>
                    <TableCell header>{t("reviewTopics.priority")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow
                      key={topic.topic}
                      className={
                        selectedTopic === topic.topic ? "bg-surface-muted" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          className="text-left hover:text-selection-from"
                          onClick={() => setSelectedTopic(topic.topic)}
                        >
                          {topic.topic}
                        </button>
                      </TableCell>
                      <TableCell>{topic.topicTitle ?? t("common.dash")}</TableCell>
                      <TableCell>{topic.totalQuestions}</TableCell>
                      <TableCell>{topic.answered}</TableCell>
                      <TableCell>{topic.correct}</TableCell>
                      <TableCell>{topic.wrong}</TableCell>
                      <TableCell>{topic.blank}</TableCell>
                      <TableCell>{topic.failedCount}</TableCell>
                      <TableCell>
                        {topic.accuracy === null
                          ? t("reviewTopics.noAttempts")
                          : `${topic.accuracy}%`}
                      </TableCell>
                      <TableCell className="capitalize">{topic.priority}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Card>

          {activeTopic ? (
            <Card as="section">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("test.trainTopic")}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {activeTopic.topicTitle
                  ? `${activeTopic.topic} — ${activeTopic.topicTitle}`
                  : activeTopic.topic}
              </p>

              <p className="mt-4 text-sm font-medium text-text-primary">
                {t("test.numberOfQuestions")}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TOPIC_QUESTION_COUNTS.map((count) => (
                  <SelectableOption
                    key={String(count)}
                    selected={selectedCount === count}
                    onClick={() => setSelectedCount(count)}
                    className="px-3 py-3"
                  >
                    {count === "all"
                      ? t("test.filterAll")
                      : t("test.questionsCount", { count })}
                  </SelectableOption>
                ))}
              </div>

              <p className="mt-4 text-sm font-medium text-text-primary">
                {t("test.topicLabel")}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["all", "test.topicFilterAll"],
                    ["failed", "test.topicFilterFailed"],
                    ["unseen", "test.topicFilterUnseen"],
                  ] as const
                ).map(([filter, labelKey]) => (
                  <SelectableOption
                    key={filter}
                    selected={selectedFilter === filter}
                    onClick={() => setSelectedFilter(filter)}
                    className="px-3 py-3"
                  >
                    {t(labelKey)}
                  </SelectableOption>
                ))}
              </div>

              <Button className="mt-4" onClick={handleTrainTopic}>
                {t("test.trainTopic")}
              </Button>
            </Card>
          ) : null}
        </>
      ) : (
        <EmptyState
          title={t("reviewTopics.noTopicsFound")}
          description={t("reviewTopics.noTopicsDescription")}
          action={
            <Button href="/import" variant="secondary">
              {t("reviewTopics.goToImport")}
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}
