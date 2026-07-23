import { getAdminGateStatus } from "@/app/actions/admin";
import { TopicMetadataDiagnosticsPageContent } from "@/components/pages/TopicMetadataDiagnosticsPageContent";
import { loadTopicMetadataDiagnostics } from "@/lib/topicMetadataDiagnostics";

export default async function TopicMetadataDiagnosticsPage() {
  const gate = await getAdminGateStatus();

  if (!gate.authorized) {
    return <TopicMetadataDiagnosticsPageContent />;
  }

  const diagnostics = await loadTopicMetadataDiagnostics();
  return <TopicMetadataDiagnosticsPageContent diagnostics={diagnostics} />;
}
