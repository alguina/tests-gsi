import { cookies } from "next/headers";
import { HistoryPageContent } from "@/components/pages/HistoryPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { getRecentSessions } from "@/lib/studyMetrics";

type HistoryPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const cookieStore = await cookies();
  const userId =
    cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const result = await getRecentSessions(userId, { page, pageSize: 20 });

  return (
    <HistoryPageContent
      sessions={result.sessions}
      page={result.page}
      pageSize={result.pageSize}
      total={result.total}
    />
  );
}
