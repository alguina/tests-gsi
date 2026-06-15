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

function formatTopicName(
  topic: ReviewTopicsPageContentProps["topics"][number],
  t: ReturnType<typeof useI18n>["t"],
): string {
  if (topic.displayLabel.trim()) {
    return topic.displayLabel;
  }

  return t("topics.noTopic");
}

export function ReviewTopicsPageContent({ topics }: ReviewTopicsPageContentProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | "all">(10);
  const [selectedFilter, setSelectedFilter] =
    useState<TopicQuestionFilter>("all");

  const activeTopic = topics.find((topic) => topic.topic === selectedTopic);

  function handleTrainTopic(topicCode: string, count = selectedCount, filter = selectedFilter) {
    router.push(
      `/test?mode=topic&topic=${encodeURIComponent(topicCode)}&count=${count}&filter=${filter}`,
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
                    <TableCell header>{t("topics.descriptionBlock")}</TableCell>
                    <TableCell header>{t("topics.availableQuestions")}</TableCell>
                    <TableCell header>{t("topics.answered")}</TableCell>
                    <TableCell header>{t("topics.correct")}</TableCell>
                    <TableCell header>{t("topics.wrong")}</TableCell>
                    <TableCell header>{t("topics.blank")}</TableCell>
                    <TableCell header>{t("topics.accuracy")}</TableCell>
                    <TableCell header>{t("topics.action")}</TableCell>
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
                          {formatTopicName(topic, t)}
                        </button>
                        {topic.sourceHint ? (
                          <p className="mt-1 text-xs text-text-muted">
                            {topic.sourceHint}
                          </p>
                        ) : null}
                        {topic.rawBlock && topic.rawBlock !== topic.displayLabel ? (
                          <p className="mt-1 text-xs text-text-muted">
                            {t("topics.rawBlock")}: {topic.rawBlock}
                            {topic.topic ? ` · ${t("topics.rawTopic")}: ${topic.topic}` : ""}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {topic.description ?? t("common.dash")}
                      </TableCell>
                      <TableCell>{topic.totalQuestions}</TableCell>
                      <TableCell>{topic.answered}</TableCell>
                      <TableCell>{topic.correct}</TableCell>
                      <TableCell>{topic.wrong}</TableCell>
                      <TableCell>{topic.blank}</TableCell>
                      <TableCell>
                        {topic.accuracy === null
                          ? t("reviewTopics.noAttempts")
                          : `${topic.accuracy}%`}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleTrainTopic(topic.topic)}
                        >
                          {t("topics.trainTopic")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Card>

          {activeTopic ? (
            <Card as="section">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("topics.trainTopic")}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {formatTopicName(activeTopic, t)}
                {activeTopic.description
                  ? ` — ${activeTopic.description}`
                  : null}
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

              <Button
                className="mt-4"
                onClick={() => handleTrainTopic(activeTopic.topic)}
              >
                {t("topics.trainTopic")}
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
