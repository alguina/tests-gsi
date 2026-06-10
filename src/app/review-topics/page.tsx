import { cookies } from "next/headers";
import { ReviewTopicsPageContent } from "@/components/pages/ReviewTopicsPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getTopicSummaries } from "@/lib/studyMetrics";

export default async function ReviewTopicsPage() {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;

  const topics = await getTopicSummaries(userId);

  return <ReviewTopicsPageContent topics={topics} />;
}
