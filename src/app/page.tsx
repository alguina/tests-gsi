import { cookies } from "next/headers";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getHomeStudyStats } from "@/lib/studyMetrics";

export default async function Home() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;

  const stats = await getHomeStudyStats(userId);

  return <HomePageContent stats={stats} />;
}
