import { notFound } from "next/navigation";
import { loadSessionResult } from "@/app/actions/test";
import { TestSessionResultsContent } from "@/components/pages/TestSessionResultsContent";

type TestSessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TestSessionPage({ params }: TestSessionPageProps) {
  const { id } = await params;
  const result = await loadSessionResult(id);

  if (!result) {
    notFound();
  }

  return <TestSessionResultsContent result={result} />;
}
