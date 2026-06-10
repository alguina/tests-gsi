import { DashboardPageContent } from "@/components/pages/DashboardPageContent";
import { getHomeStudyStats } from "@/lib/studyMetrics";

export default async function DashboardPage() {
  const stats = await getHomeStudyStats();

  return <DashboardPageContent stats={stats} />;
}
