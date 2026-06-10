import { DashboardPageContent } from "@/components/pages/DashboardPageContent";
import { getDashboardStats, getHomeStudyStats } from "@/lib/studyMetrics";

export default async function DashboardPage() {
  const [stats, dashboardStats] = await Promise.all([
    getHomeStudyStats(),
    getDashboardStats(),
  ]);

  return (
    <DashboardPageContent stats={stats} dashboardStats={dashboardStats} />
  );
}
