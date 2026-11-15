import { StudyPageContent } from "@/components/pages/StudyPageContent";
import { TEMARIO_OFICIAL } from "@/lib/officialTopics";

export default function StudyPage() {
  return <StudyPageContent topics={TEMARIO_OFICIAL} />;
}

