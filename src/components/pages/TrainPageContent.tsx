"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadFailedQuestionsCount, loadStudyRecommendation } from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import {
  QUESTION_COUNT_PILL_CLASS,
  QuestionCountSelector,
} from "@/components/training/QuestionCountSelector";
import { TrainingModePanel } from "@/components/training/TrainingModePanel";
import { SelectableOption } from "@/components/ui/SelectableOption";
import { Button } from "@/components/ui/Button";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import { formatRecommendationReason } from "@/lib/recommendations/formatReasons";
import { RECOMMENDED_DEFAULT_COUNT } from "@/lib/recommendations/constants";
import type { StudyRecommendation } from "@/lib/recommendations/types";
import type { TopicSummary } from "@/lib/studyMetrics";
import type { TopicQuestionFilter } from "@/lib/testDraft";
import {
  EXAM_DEFAULT_QUESTION_COUNT,
  EXAM_DEFAULT_TIME_LIMIT_SECONDS,
  EXAM_QUESTION_COUNTS,
  EXAM_TIME_LIMITS_MINUTES,
  FAILED_QUESTION_COUNTS,
  TEST_QUESTION_COUNTS,
  TOPIC_QUESTION_COUNTS,
} from "@/lib/testSession";

const RECOMMENDED_QUESTION_COUNTS = [10, 25, 50] as const;

const TRAIN_TABS = [
  "random",
  "recommended",
  "mistakes",
  "topic",
  "simulation",
] as const;

type TrainTabId = (typeof TRAIN_TABS)[number];

type TrainPageContentProps = {
  hasRecommendationData?: boolean;
  topics?: TopicSummary[];
};

function isTrainTab(value: string | null): value is TrainTabId {
  return TRAIN_TABS.includes(value as TrainTabId);
}

export function TrainPageContent({
  hasRecommendationData: hasRecommendationDataProp,
  topics = [],
}: TrainPageContentProps = {}) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? searchParams.get("focus");
  const initialTab = tabParam === "failed" ? "mistakes" : tabParam;
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState<TrainTabId>(
    isTrainTab(initialTab) ? initialTab : "random",
  );
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [failedCount, setFailedCount] = useState<number | null>(null);
  const [selectedFailedCount, setSelectedFailedCount] = useState<number | "all">(
    10,
  );
  const [recommendedCount, setRecommendedCount] = useState<number>(
    RECOMMENDED_DEFAULT_COUNT,
  );
  const [recommendation, setRecommendation] = useState<StudyRecommendation | null>(
    null,
  );
  const [examQuestionCount, setExamQuestionCount] = useState(
    EXAM_DEFAULT_QUESTION_COUNT,
  );
  const [examTimeMinutes, setExamTimeMinutes] = useState(
    EXAM_DEFAULT_TIME_LIMIT_SECONDS / 60,
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(
    topics[0]?.topic ?? "",
  );
  const [selectedTopicCount, setSelectedTopicCount] = useState<number | "all">(
    10,
  );
  const [selectedTopicFilter, setSelectedTopicFilter] =
    useState<TopicQuestionFilter>("all");
  const [hasRecommendationDataState, setHasRecommendationDataState] =
    useState(false);

  const hasRecommendationData =
    hasRecommendationDataProp ?? hasRecommendationDataState;

  const tabs = useMemo(
    () => [
      { id: "random", label: t("training.random") },
      { id: "recommended", label: t("training.recommended") },
      { id: "mistakes", label: t("training.mistakes") },
      { id: "topic", label: t("training.byTopic") },
      { id: "simulation", label: t("training.simulation") },
    ],
    [t],
  );

  useEffect(() => {
    if (isTrainTab(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (topics.length && !selectedTopic) {
      setSelectedTopic(topics[0].topic);
    }
  }, [selectedTopic, topics]);

  useEffect(() => {
    void loadFailedQuestionsCount(profile?.id).then(setFailedCount);
    void loadStudyRecommendation(profile?.id, RECOMMENDED_DEFAULT_COUNT).then(
      (value) => {
        setRecommendation(value);
        if (hasRecommendationDataProp === undefined) {
          setHasRecommendationDataState(Boolean(value?.topics.length));
        }
      },
    );
  }, [hasRecommendationDataProp, profile?.id]);

  function handleTabChange(tabId: string) {
    if (!isTrainTab(tabId)) {
      return;
    }

    setActiveTab(tabId);
    router.replace(`/train?tab=${tabId}`, { scroll: false });
  }

  function handleStartRandomTest() {
    router.push(`/test?count=${selectedCount}`);
  }

  function handleStartFailedTest() {
    router.push(`/test?mode=failed&count=${selectedFailedCount}`);
  }

  function handleStartRecommendedTest() {
    router.push(`/test?mode=recommended&count=${recommendedCount}`);
  }

  function handleStartTopicTest() {
    if (!selectedTopic) {
      return;
    }

    router.push(
      `/test?mode=topic&topic=${encodeURIComponent(selectedTopic)}&count=${selectedTopicCount}&filter=${selectedTopicFilter}`,
    );
  }

  function handleStartExamSimulation() {
    router.push(
      `/test/exam?start=1&count=${examQuestionCount}&time=${examTimeMinutes}`,
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("trainSection.eyebrow")}
        title={t("nav.train")}
        description={t("trainSection.description")}
      />

      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={handleTabChange}
        ariaLabel={t("nav.train")}
      />

      <TabPanel id="random" labelledBy="tab-random" hidden={activeTab !== "random"}>
        <TrainingModePanel
          title={t("training.randomTitle")}
          description={t("training.randomDescription")}
          controls={
            <QuestionCountSelector
              label={t("test.numberOfQuestions")}
              options={TEST_QUESTION_COUNTS}
              value={selectedCount}
              onChange={setSelectedCount}
            />
          }
          action={
            <Button onClick={handleStartRandomTest}>
              {t("training.startRandom")}
            </Button>
          }
        />
      </TabPanel>

      <TabPanel
        id="recommended"
        labelledBy="tab-recommended"
        hidden={activeTab !== "recommended"}
      >
        <TrainingModePanel
          title={t("training.recommendedTitle")}
          description={t("training.recommendedDescription")}
          helperText={
            !hasRecommendationData
              ? t("training.notEnoughDataForRecommendations")
              : undefined
          }
          controls={
            hasRecommendationData ? (
              <>
                {recommendation?.reasons.length ? (
                  <ul className="space-y-2 rounded-md bg-surface-muted p-3 text-sm text-text-secondary">
                    {recommendation.reasons.map((reason) => (
                      <li key={reason.code}>
                        {formatRecommendationReason(t, reason)}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <QuestionCountSelector
                  label={t("test.numberOfQuestions")}
                  options={RECOMMENDED_QUESTION_COUNTS}
                  value={recommendedCount}
                  onChange={setRecommendedCount}
                />
              </>
            ) : undefined
          }
          action={
            <Button
              onClick={handleStartRecommendedTest}
              disabled={!hasRecommendationData}
            >
              {t("training.startRecommended")}
            </Button>
          }
        />
      </TabPanel>

      <TabPanel
        id="mistakes"
        labelledBy="tab-mistakes"
        hidden={activeTab !== "mistakes"}
      >
        <TrainingModePanel
          title={t("training.mistakesTitle")}
          description={t("training.mistakesDescription")}
          emptyState={
            failedCount === 0
              ? {
                  title: t("test.noFailedQuestions"),
                  description: t("training.mistakesDescription"),
                }
              : undefined
          }
          controls={
            failedCount !== null && failedCount > 0 ? (
              <QuestionCountSelector
                label={t("test.numberOfQuestions")}
                options={FAILED_QUESTION_COUNTS}
                value={selectedFailedCount}
                onChange={setSelectedFailedCount}
              />
            ) : undefined
          }
          action={
            failedCount !== null && failedCount > 0 ? (
              <Button onClick={handleStartFailedTest}>
                {t("training.startMistakes")}
              </Button>
            ) : undefined
          }
        />
      </TabPanel>

      <TabPanel id="topic" labelledBy="tab-topic" hidden={activeTab !== "topic"}>
        <TrainingModePanel
          title={t("training.byTopicTitle")}
          description={t("training.byTopicDescription")}
          emptyState={
            topics.length === 0
              ? {
                  title: t("reviewTopics.noTopicsFound"),
                  description: t("reviewTopics.noTopicsDescription"),
                }
              : undefined
          }
          controls={
            topics.length > 0 ? (
              <>
                <p className="text-sm font-medium text-text-primary">
                  {t("test.topicLabel")}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {topics.map((topic) => (
                    <SelectableOption
                      key={topic.topic}
                      selected={selectedTopic === topic.topic}
                      onClick={() => setSelectedTopic(topic.topic)}
                      className={`${QUESTION_COUNT_PILL_CLASS} text-left`}
                    >
                      {topic.displayLabel.trim() || t("topics.noTopic")}
                    </SelectableOption>
                  ))}
                </div>
                <QuestionCountSelector
                  label={t("test.numberOfQuestions")}
                  options={TOPIC_QUESTION_COUNTS}
                  value={selectedTopicCount}
                  onChange={setSelectedTopicCount}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      ["all", "test.topicFilterAll"],
                      ["failed", "test.topicFilterFailed"],
                      ["unseen", "test.topicFilterUnseen"],
                    ] as const
                  ).map(([filter, labelKey]) => (
                    <SelectableOption
                      key={filter}
                      selected={selectedTopicFilter === filter}
                      onClick={() => setSelectedTopicFilter(filter)}
                      className={QUESTION_COUNT_PILL_CLASS}
                    >
                      {t(labelKey)}
                    </SelectableOption>
                  ))}
                </div>
              </>
            ) : undefined
          }
          action={
            topics.length > 0 ? (
              <Button onClick={handleStartTopicTest} disabled={!selectedTopic}>
                {t("training.startByTopic")}
              </Button>
            ) : undefined
          }
        />
      </TabPanel>

      <TabPanel
        id="simulation"
        labelledBy="tab-simulation"
        hidden={activeTab !== "simulation"}
      >
        <TrainingModePanel
          title={t("training.simulationTitle")}
          description={t("training.simulationDescription")}
          helperText={t("exam.scoringRules")}
          controls={
            <>
              <QuestionCountSelector
                label={t("exam.questionCount")}
                options={EXAM_QUESTION_COUNTS}
                value={examQuestionCount}
                onChange={setExamQuestionCount}
              />
              <QuestionCountSelector
                label={t("exam.timeLimit")}
                options={EXAM_TIME_LIMITS_MINUTES}
                value={examTimeMinutes}
                onChange={setExamTimeMinutes}
                formatLabel={(minutes) => t("exam.minutes", { count: minutes })}
              />
            </>
          }
          action={
            <Button onClick={handleStartExamSimulation}>
              {t("training.startSimulation")}
            </Button>
          }
        />
      </TabPanel>
    </PageContainer>
  );
}

/** @deprecated Use TrainPageContent */
export const TakeTestPageContent = TrainPageContent;
