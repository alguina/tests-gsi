import { SavedPageContent } from "@/components/pages/SavedPageContent";
import { getDatabaseStats } from "@/lib/databaseStats";

export default async function SavedPage() {
  let stats = null;
  let loadFailed = false;

  try {
    stats = await getDatabaseStats();
  } catch {
    loadFailed = true;
  }

  return <SavedPageContent stats={stats} loadFailed={loadFailed} />;
}
