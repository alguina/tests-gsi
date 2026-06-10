"use server";

import {
  getSessionResult,
  startRandomTestSession,
  submitTestSession,
  type StartedTestSession,
  type TestQuestion,
  type TestResult,
  type TestSelection,
} from "@/lib/testSession";

export async function startRandomTest(
  count: number,
): Promise<StartedTestSession> {
  return startRandomTestSession(count);
}

export async function submitTest(
  sessionId: string,
  questions: TestQuestion[],
  selections: TestSelection[],
): Promise<TestResult> {
  return submitTestSession(sessionId, questions, selections);
}

export async function loadSessionResult(
  sessionId: string,
): Promise<TestResult | null> {
  return getSessionResult(sessionId);
}
