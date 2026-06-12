import { notFound } from "next/navigation";
import { loadExamSessionResult, loadSessionResult } from "@/app/actions/test";
import { ExamResultsContent } from "@/components/pages/ExamResultsContent";
import { TestSessionResultsContent } from "@/components/pages/TestSessionResultsContent";
import { TEST_MODE_EXAM } from "@/lib/testSession";

type TestSessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TestSessionPage({ params }: TestSessionPageProps) {
  const { id } = await params;
  const result = await loadSessionResult(id);

  if (!result) {
    notFound();
  }

  if (result.mode === TEST_MODE_EXAM) {
    const examResult = await loadExamSessionResult(id);

    if (examResult) {
      return (
        <TestSessionResultsContent
          result={examResult}
          examResults={<ExamResultsContent result={examResult} />}
        />
      );
    }
  }

  return <TestSessionResultsContent result={result} />;
}
