"use server";

import type { ParsedTest } from "@/lib/preparaticParser";
import { saveParsedTest, type SaveTestResult } from "@/lib/saveParsedTest";

export async function saveTestToDatabase(
  test: ParsedTest,
): Promise<SaveTestResult> {
  return saveParsedTest(test);
}
