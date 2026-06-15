import { cookies } from "next/headers";
import { Suspense } from "react";
import { TrainPageContent } from "@/components/pages/TrainPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getHomeStudyStats, getTopicSummaries } from "@/lib/studyMetrics";

export default async function TrainPage() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;

  const [stats, topics] = await Promise.all([
    getHomeStudyStats(userId),
    getTopicSummaries(userId),
  ]);

  return (
    <Suspense fallback={null}>
      <TrainPageContent
        hasRecommendationData={stats.questionsAnswered > 0}
        topics={topics}
      />
    </Suspense>
  );
}
