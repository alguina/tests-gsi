import canonicalRaw from "@/data/question-canonical-v1.json";
import { getOfficialTopic } from "@/lib/officialTopics";

export type TopicAttempt = { question_id: string; is_correct: boolean; is_blank: boolean };
export type TopicPractice = { attempts: number; correct: number; wrong: number; blank: number; unique: number; accuracy: number | null };
export type OfficialTopicResults = { topics: Record<string, TopicPractice>; unassigned: number; lowerConfidence: number; totalAttempts: number };
const canonical = canonicalRaw as Record<string, string>;

/** Coverage counts canonical text+options, while accuracy counts nonblank attempts. */
export function computeOfficialTopicResults(attempts: TopicAttempt[]): OfficialTopicResults {
  const topics: Record<string, TopicPractice> = {};
  const seen = new Map<string, Set<string>>();
  let unassigned = 0;
  let lowerConfidence = 0;
  for (const row of attempts) {
    const topic = getOfficialTopic(canonical[row.question_id] ?? row.question_id);
    if (!topic || topic.confianza === "sin_asignar") { unassigned++; continue; }
    // Match the high-confidence practice pool. Other bands remain pending, not attributed.
    if (topic.confianza !== "alta" && topic.confianza !== "revisada") { lowerConfidence++; continue; }
    const key = `${topic.bloque}.${topic.tema}`;
    const stats = topics[key] ??= { attempts: 0, correct: 0, wrong: 0, blank: 0, unique: 0, accuracy: null };
    stats.attempts++;
    if (row.is_blank) stats.blank++;
    else if (row.is_correct) stats.correct++;
    else stats.wrong++;
    const ids = seen.get(key) ?? new Set<string>();
    ids.add(canonical[row.question_id] ?? row.question_id);
    seen.set(key, ids);
  }
  for (const [key, stats] of Object.entries(topics)) {
    stats.unique = seen.get(key)!.size;
    const answered = stats.correct + stats.wrong;
    stats.accuracy = answered ? Math.round(stats.correct / answered * 1000) / 10 : null;
  }
  return { topics, unassigned, lowerConfidence, totalAttempts: attempts.length };
}
