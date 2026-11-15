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
import type { getTopicSummaries } from "@/lib/studyMetrics";

const OFFICIAL_TOPIC_QUESTION_COUNTS = [10, 25, 50] as const;

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
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const activeTopic = topics.find((topic) => topic.topic === selectedTopic);

  function handleTrainTopic(topicCode: string, count = selectedCount) {
    router.push(
      `/test?mode=official-topic&topic=${encodeURIComponent(topicCode)}&count=${count}`,
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
              <h2 className="text-base font-medium tracking-tight text-text-primary">
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
                {OFFICIAL_TOPIC_QUESTION_COUNTS.map((count) => (
                  <SelectableOption
                    key={String(count)}
                    selected={selectedCount === count}
                    onClick={() => setSelectedCount(count)}
                    className="px-3 py-3"
                  >
                    {t("test.questionsCount", { count })}
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
