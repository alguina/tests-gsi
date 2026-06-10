import { cookies } from "next/headers";
import { DashboardPageContent } from "@/components/pages/DashboardPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getDashboardStats, getHomeStudyStats } from "@/lib/studyMetrics";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;

  const [stats, dashboardStats] = await Promise.all([
    getHomeStudyStats(userId),
    getDashboardStats(userId),
  ]);

  return (
    <DashboardPageContent stats={stats} dashboardStats={dashboardStats} />
  );
}
