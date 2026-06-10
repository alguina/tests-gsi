import { HistoryPageContent } from "@/components/pages/HistoryPageContent";
import { getRecentSessions } from "@/lib/studyMetrics";

export default async function HistoryPage() {
  const sessions = await getRecentSessions();

  return <HistoryPageContent sessions={sessions} />;
}
