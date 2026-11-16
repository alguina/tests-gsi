import { notFound } from "next/navigation";
import { StudyTopicPageContent } from "@/components/pages/StudyTopicPageContent";
import { findOfficialTopic, TEMARIO_OFICIAL } from "@/lib/officialTopics";

export default async function StudyTopicPage({ params }: PageProps<"/study/[code]">) {
  const { code } = await params;
  const topic = findOfficialTopic(code);
  if (!topic) notFound();

  const index = TEMARIO_OFICIAL.findIndex(
    (item) => item.bloque === topic.bloque && item.tema === topic.tema,
  );

  return (
    <StudyTopicPageContent
      topic={topic}
      nextTopic={TEMARIO_OFICIAL[index + 1] ?? null}
    />
  );
}

