"use server";

import {
  actionFail,
  actionOk,
  toActionError,
  type ActionResult,
} from "@/lib/actionResult";
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
): Promise<ActionResult<StartedTestSession>> {
  try {
    const data = await startRandomTestSession(count);
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function submitTest(
  sessionId: string,
  questions: TestQuestion[],
  selections: TestSelection[],
): Promise<ActionResult<TestResult>> {
  try {
    const data = await submitTestSession(sessionId, questions, selections);
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadSessionResult(
  sessionId: string,
): Promise<TestResult | null> {
  try {
    return await getSessionResult(sessionId);
  } catch {
    return null;
  }
}
