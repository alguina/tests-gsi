import { ReviewTopicsPageContent } from "@/components/pages/ReviewTopicsPageContent";
import { getTopicSummaries } from "@/lib/studyMetrics";

export default async function ReviewTopicsPage() {
  const topics = await getTopicSummaries();

  return <ReviewTopicsPageContent topics={topics} />;
}
