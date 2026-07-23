import { createServerSupabaseClient } from "@/lib/supabase/server";

const PAGE_SIZE = 1000;
const EMPTY_VALUE = "(empty)";
const MAX_FREQUENCY_ROWS = 100;
const MAX_COMBINATION_ROWS = 250;
const MAX_EXAMPLES_PER_COMBINATION = 3;

type SourceRelation = {
  title: string | null;
  source_type: string | null;
};

type QuestionMetadataRow = {
  id: string;
  text: string;
  block: string | null;
  topic: string | null;
  exam: string | null;
  year: string | null;
  sources: SourceRelation | SourceRelation[] | null;
};

export type MetadataFrequencyRow = {
  value: string;
  count: number;
};

export type BlockTopicCombinationRow = {
  block: string;
  topic: string;
  count: number;
};

export type TopicMetadataExampleRow = {
  block: string;
  topic: string;
  exam: string;
  year: string;
  sourceTitle: string;
  sourceType: string;
  count: number;
  examples: string[];
};

export type TopicMetadataDiagnostics = {
  totalQuestions: number;
  blockValues: MetadataFrequencyRow[];
  topicValues: MetadataFrequencyRow[];
  blockTopicCombinations: BlockTopicCombinationRow[];
  examValues: MetadataFrequencyRow[];
  yearValues: MetadataFrequencyRow[];
  sourceTitles: MetadataFrequencyRow[];
  sourceTypes: MetadataFrequencyRow[];
  examplesByCombination: TopicMetadataExampleRow[];
};

function normalizeValue(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim();
  return normalized || EMPTY_VALUE;
}

function getSource(row: QuestionMetadataRow): SourceRelation | null {
  if (Array.isArray(row.sources)) {
    return row.sources[0] ?? null;
  }

  return row.sources;
}

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function toFrequencyRows(map: Map<string, number>, limit = MAX_FREQUENCY_ROWS) {
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .slice(0, limit);
}

async function loadAllQuestionMetadata(): Promise<QuestionMetadataRow[]> {
  const supabase = createServerSupabaseClient();
  const rows: QuestionMetadataRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, text, block, topic, exam, year, sources(title, source_type)")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const page = (data ?? []) as QuestionMetadataRow[];
    rows.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

export async function loadTopicMetadataDiagnostics(): Promise<TopicMetadataDiagnostics> {
  const rows = await loadAllQuestionMetadata();

  const blockCounts = new Map<string, number>();
  const topicCounts = new Map<string, number>();
  const blockTopicCounts = new Map<string, { block: string; topic: string; count: number }>();
  const examCounts = new Map<string, number>();
  const yearCounts = new Map<string, number>();
  const sourceTitleCounts = new Map<string, number>();
  const sourceTypeCounts = new Map<string, number>();
  const exampleGroups = new Map<string, TopicMetadataExampleRow>();

  for (const row of rows) {
    const source = getSource(row);
    const block = normalizeValue(row.block);
    const topic = normalizeValue(row.topic);
    const exam = normalizeValue(row.exam);
    const year = normalizeValue(row.year);
    const sourceTitle = normalizeValue(source?.title);
    const sourceType = normalizeValue(source?.source_type);

    increment(blockCounts, block);
    increment(topicCounts, topic);
    increment(examCounts, exam);
    increment(yearCounts, year);
    increment(sourceTitleCounts, sourceTitle);
    increment(sourceTypeCounts, sourceType);

    const blockTopicKey = `${block}\u0000${topic}`;
    const blockTopic = blockTopicCounts.get(blockTopicKey) ?? {
      block,
      topic,
      count: 0,
    };
    blockTopic.count += 1;
    blockTopicCounts.set(blockTopicKey, blockTopic);

    const exampleKey = [
      block,
      topic,
      exam,
      year,
      sourceTitle,
      sourceType,
    ].join("\u0000");
    const group = exampleGroups.get(exampleKey) ?? {
      block,
      topic,
      exam,
      year,
      sourceTitle,
      sourceType,
      count: 0,
      examples: [],
    };
    group.count += 1;

    if (group.examples.length < MAX_EXAMPLES_PER_COMBINATION) {
      group.examples.push(row.text);
    }

    exampleGroups.set(exampleKey, group);
  }

  return {
    totalQuestions: rows.length,
    blockValues: toFrequencyRows(blockCounts),
    topicValues: toFrequencyRows(topicCounts),
    blockTopicCombinations: [...blockTopicCounts.values()]
      .sort(
        (left, right) =>
          right.count - left.count ||
          left.block.localeCompare(right.block) ||
          left.topic.localeCompare(right.topic),
      )
      .slice(0, MAX_COMBINATION_ROWS),
    examValues: toFrequencyRows(examCounts),
    yearValues: toFrequencyRows(yearCounts),
    sourceTitles: toFrequencyRows(sourceTitleCounts),
    sourceTypes: toFrequencyRows(sourceTypeCounts),
    examplesByCombination: [...exampleGroups.values()]
      .sort(
        (left, right) =>
          right.count - left.count ||
          left.block.localeCompare(right.block) ||
          left.topic.localeCompare(right.topic),
      )
      .slice(0, MAX_COMBINATION_ROWS),
  };
}
