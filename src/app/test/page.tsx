import { TestPageContent } from "@/components/pages/TestPageContent";
import type { TopicQuestionFilter } from "@/lib/testDraft";
import {
  FAILED_QUESTION_COUNTS,
  TEST_QUESTION_COUNTS,
  TOPIC_QUESTION_COUNTS,
} from "@/lib/testSession";

type TestPageProps = {
  searchParams: Promise<{
    count?: string;
    mode?: string;
    topic?: string;
    filter?: string;
    resume?: string;
  }>;
};

function parseCount(
  value: string | undefined,
  allowed: readonly (number | "all")[],
): number | "all" | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "all") {
    return allowed.includes("all") ? "all" : undefined;
  }

  const count = Number(value);

  return allowed.includes(count) ? count : undefined;
}

function parseFilter(value: string | undefined): TopicQuestionFilter {
  if (value === "failed" || value === "unseen") {
    return value;
  }

  return "all";
}

export default async function TestPage({ searchParams }: TestPageProps) {
  const params = await searchParams;
  const mode = params.mode ?? "random";
  const resumeSessionId = params.resume;

  if (resumeSessionId) {
    return <TestPageContent resumeSessionId={resumeSessionId} />;
  }

  if (mode === "failed") {
    const count = parseCount(params.count, FAILED_QUESTION_COUNTS);

    if (count !== undefined) {
      return (
        <TestPageContent
          autoStart={{ mode: "failed", count }}
        />
      );
    }
  }

  if (mode === "topic" && params.topic) {
    const count = parseCount(params.count, TOPIC_QUESTION_COUNTS);

    if (count !== undefined) {
      return (
        <TestPageContent
          autoStart={{
            mode: "topic",
            count,
            topic: params.topic,
            filter: parseFilter(params.filter),
          }}
        />
      );
    }
  }

  const count = Number(params.count);
  const autoStartCount = TEST_QUESTION_COUNTS.includes(
    count as (typeof TEST_QUESTION_COUNTS)[number],
  )
    ? count
    : undefined;

  return (
    <TestPageContent
      autoStart={
        autoStartCount
          ? { mode: "random", count: autoStartCount }
          : undefined
      }
    />
  );
}
