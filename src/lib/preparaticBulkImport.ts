import { parsePreparaticTest, type ParsedTest } from "@/lib/preparaticParser";
import { fetchPreparaticText } from "@/lib/preparaticClient";
import { saveParsedTest } from "@/lib/saveParsedTest";

const ALLOWED_ASSET_URL_PATTERN =
  /^https:\/\/(?:www\.)?preparatic\.org\/tests\/assets\/[a-f0-9]{32}-[a-f0-9]{8}\.js\/?$/i;

export type BulkImportTestStatus =
  | "imported"
  | "skipped"
  | "failed"
  | "dry_run_ok";

export type BulkImportTestInput = {
  hash: string;
  title: string;
  assetUrl: string;
  dryRun: boolean;
};

export type BulkImportTestLog = {
  timestamp: string;
  title: string;
  hash: string;
  status: BulkImportTestStatus;
  questionsDetected: number;
  answersDetected: number;
  questionsInserted: number;
  questionsUpdated: number;
  questionsSkipped: number;
  answersInserted: number;
  answersUpdated: number;
  answersSkipped: number;
  errorMessage: string | null;
};

export function validatePreparaticAssetUrl(assetUrl: string): string {
  const normalized = assetUrl.trim().replace(/\/$/, "");

  if (!ALLOWED_ASSET_URL_PATTERN.test(normalized)) {
    throw new Error(
      "Asset URL must point to a /tests/assets/...js file and match the expected test asset pattern.",
    );
  }

  return normalized;
}

export function prepareParsedTestForImport(
  parsedTest: ParsedTest,
  discovered: Pick<BulkImportTestInput, "hash" | "title">,
): ParsedTest {
  return {
    ...parsedTest,
    externalId: parsedTest.externalId?.trim() || discovered.hash,
    title: parsedTest.title?.trim() || discovered.title,
    questions: parsedTest.questions,
  };
}

export function countDetectedAnswers(test: ParsedTest): number {
  return test.questions.reduce(
    (total, question) => total + question.answers.length,
    0,
  );
}

export async function importDiscoveredTest(
  input: BulkImportTestInput,
): Promise<BulkImportTestLog> {
  const timestamp = new Date().toISOString();
  const baseLog = {
    timestamp,
    title: input.title,
    hash: input.hash,
    questionsInserted: 0,
    questionsUpdated: 0,
    questionsSkipped: 0,
    answersInserted: 0,
    answersUpdated: 0,
    answersSkipped: 0,
    errorMessage: null as string | null,
  };

  try {
    const assetUrl = validatePreparaticAssetUrl(input.assetUrl);
    const rawJs = await fetchPreparaticText(assetUrl);
    const parsedTest = prepareParsedTestForImport(
      parsePreparaticTest(rawJs),
      input,
    );
    const questionsDetected = parsedTest.questions.length;
    const answersDetected = countDetectedAnswers(parsedTest);

    if (input.dryRun) {
      return {
        ...baseLog,
        status: "dry_run_ok",
        questionsDetected,
        answersDetected,
      };
    }

    const saveResult = await saveParsedTest(parsedTest, {
      sourceExternalId: input.hash,
      sourceTitle: input.title,
    });

    return {
      ...baseLog,
      status: "imported",
      questionsDetected,
      answersDetected,
      questionsInserted: saveResult.questionsInserted,
      questionsUpdated: saveResult.questionsUpdated,
      questionsSkipped: saveResult.questionsSkipped,
      answersInserted: saveResult.answersInserted,
      answersUpdated: saveResult.answersUpdated,
      answersSkipped: saveResult.answersSkipped,
    };
  } catch (importError) {
    return {
      ...baseLog,
      status: "failed",
      questionsDetected: 0,
      answersDetected: 0,
      errorMessage:
        importError instanceof Error
          ? importError.message
          : "Unknown import error.",
    };
  }
}

export function selectImportBatch<
  T extends {
    hash: string;
    assetUrl: string | null;
    importStatus: "imported" | "not_imported";
  },
>(
  tests: T[],
  options: {
    limit: number;
    skipAlreadyImported: boolean;
  },
): T[] {
  return tests
    .filter((test) => Boolean(test.assetUrl))
    .filter(
      (test) =>
        !options.skipAlreadyImported || test.importStatus === "not_imported",
    )
    .slice(0, Math.max(options.limit, 0));
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
