import { cookies } from "next/headers";
import { Suspense } from "react";
import { TrainPageContent } from "@/components/pages/TrainPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getHomeStudyStats } from "@/lib/studyMetrics";

export default async function TrainPage() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
  const stats = await getHomeStudyStats(userId);

  return (
    <Suspense fallback={null}>
      <TrainPageContent
        hasRecommendationData={stats.totalQuestionsAnswered > 0}
      />
    </Suspense>
  );
}
