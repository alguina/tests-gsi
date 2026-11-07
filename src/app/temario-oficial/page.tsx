import { TemarioOficialPageContent } from "@/components/pages/TemarioOficialPageContent";
import { getOfficialCoverage } from "@/lib/officialTopics";

export default function TemarioOficialPage() {
  const cobertura = getOfficialCoverage();
  return <TemarioOficialPageContent cobertura={cobertura} />;
}
