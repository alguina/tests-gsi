"use server";

import { cookies } from "next/headers";
import {
  actionOk,
  toActionError,
  type ActionResult,
} from "@/lib/actionResult";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import {
  getSessionResult,
  startRandomTestSession,
  submitTestSession,
  type StartedTestSession,
  type TestQuestion,
  type TestResult,
  type TestSelection,
} from "@/lib/testSession";

async function resolveUserId(clientUserId?: string): Promise<string> {
  if (clientUserId) {
    return clientUserId;
  }

  const cookieStore = await cookies();
  return cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
}

export async function startRandomTest(
  count: number,
  userId?: string,
): Promise<ActionResult<StartedTestSession>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await startRandomTestSession(count, resolvedUserId);
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function submitTest(
  sessionId: string,
  questions: TestQuestion[],
  selections: TestSelection[],
  userId?: string,
): Promise<ActionResult<TestResult>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await submitTestSession(
      sessionId,
      questions,
      selections,
      resolvedUserId,
    );
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadSessionResult(
  sessionId: string,
): Promise<TestResult | null> {
  try {
    const cookieStore = await cookies();
    const userId =
      cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
    return await getSessionResult(sessionId, userId);
  } catch {
    return null;
  }
}
