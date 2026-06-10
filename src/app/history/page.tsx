import { cookies } from "next/headers";
import { HistoryPageContent } from "@/components/pages/HistoryPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getRecentSessions } from "@/lib/studyMetrics";

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;

  const sessions = await getRecentSessions(userId);

  return <HistoryPageContent sessions={sessions} />;
}
