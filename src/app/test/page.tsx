import { TestPageContent } from "@/components/pages/TestPageContent";
import { TEST_QUESTION_COUNTS } from "@/lib/testSession";

type TestPageProps = {
  searchParams: Promise<{ count?: string }>;
};

export default async function TestPage({ searchParams }: TestPageProps) {
  const params = await searchParams;
  const count = Number(params.count);
  const autoStartCount = TEST_QUESTION_COUNTS.includes(
    count as (typeof TEST_QUESTION_COUNTS)[number],
  )
    ? count
    : undefined;

  return <TestPageContent autoStartCount={autoStartCount} />;
}
