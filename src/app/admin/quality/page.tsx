import { DataQualityPageContent } from "@/components/pages/DataQualityPageContent";
import { getAdminGateStatus } from "@/app/actions/admin";

export default async function DataQualityPage() {
  const gate = await getAdminGateStatus();
  return <DataQualityPageContent gate={gate} />;
}
