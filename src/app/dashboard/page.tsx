import { cookies } from "next/headers";
import { DashboardPageContent } from "@/components/pages/DashboardPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getDashboardStudyMetrics } from "@/lib/studyMetrics";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;

  const metrics = await getDashboardStudyMetrics(userId);

  return <DashboardPageContent metrics={metrics} />;
}
