"use server";

import {
  fetchRandomTestQuestions,
  submitTestSession,
  type TestQuestion,
  type TestResult,
  type TestSelection,
} from "@/lib/testSession";

export async function loadRandomTestQuestions(
  count: number,
): Promise<TestQuestion[]> {
  return fetchRandomTestQuestions(count);
}

export async function submitTest(
  questions: TestQuestion[],
  selections: TestSelection[],
): Promise<TestResult> {
  return submitTestSession(questions, selections);
}
