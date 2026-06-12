import { cookies } from "next/headers";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { loadStudyRecommendation } from "@/app/actions/test";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { RECOMMENDED_DEFAULT_COUNT } from "@/lib/recommendations/constants";
import { getHomeStudyStats } from "@/lib/studyMetrics";

export default async function Home() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;

  const [stats, recommendation] = await Promise.all([
    getHomeStudyStats(userId),
    loadStudyRecommendation(userId, RECOMMENDED_DEFAULT_COUNT),
  ]);

  return (
    <HomePageContent stats={stats} recommendation={recommendation} />
  );
}
