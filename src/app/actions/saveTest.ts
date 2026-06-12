"use server";

import type { ParsedTest } from "@/lib/preparaticParser";
import { requireAdminFromCookie } from "@/app/actions/admin";
import { saveParsedTest, type SaveTestResult } from "@/lib/saveParsedTest";

export async function saveTestToDatabase(
  test: ParsedTest,
): Promise<SaveTestResult> {
  await requireAdminFromCookie();
  return saveParsedTest(test);
}
