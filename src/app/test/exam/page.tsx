import { ExamTestPageContent } from "@/components/pages/ExamTestPageContent";
import {
  EXAM_DEFAULT_QUESTION_COUNT,
  EXAM_DEFAULT_TIME_LIMIT_SECONDS,
  EXAM_QUESTION_COUNTS,
  EXAM_TIME_LIMITS_MINUTES,
} from "@/lib/testSession";

type ExamPageProps = {
  searchParams: Promise<{
    count?: string;
    time?: string;
    resume?: string;
    start?: string;
  }>;
};

export default async function ExamPage({ searchParams }: ExamPageProps) {
  const params = await searchParams;
  const resumeSessionId = params.resume;

  if (resumeSessionId) {
    return <ExamTestPageContent resumeSessionId={resumeSessionId} />;
  }

  if (params.start === "1") {
    const count = Number(params.count);
    const questionCount = EXAM_QUESTION_COUNTS.includes(
      count as (typeof EXAM_QUESTION_COUNTS)[number],
    )
      ? count
      : EXAM_DEFAULT_QUESTION_COUNT;

    const timeMinutes = Number(params.time);
    const timeLimitSeconds = EXAM_TIME_LIMITS_MINUTES.includes(
      timeMinutes as (typeof EXAM_TIME_LIMITS_MINUTES)[number],
    )
      ? timeMinutes * 60
      : EXAM_DEFAULT_TIME_LIMIT_SECONDS;

    return (
      <ExamTestPageContent
        autoStart={{ questionCount, timeLimitSeconds }}
      />
    );
  }

  return <ExamTestPageContent />;
}
