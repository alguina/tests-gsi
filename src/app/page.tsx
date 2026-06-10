import { HomePageContent } from "@/components/pages/HomePageContent";
import { getHomeStudyStats } from "@/lib/studyMetrics";

export default async function Home() {
  const stats = await getHomeStudyStats();

  return <HomePageContent stats={stats} />;
}
