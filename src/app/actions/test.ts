"use server";

import { cookies } from "next/headers";
import {
  actionOk,
  toActionError,
  type ActionResult,
} from "@/lib/actionResult";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import {
  getQuestionBookmarks,
  getQuestionNotes,
  saveQuestionNote,
  toggleQuestionBookmark,
  type QuestionBookmarkMap,
  type QuestionNoteMap,
} from "@/lib/questionReview";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import type { TestDraftState, TopicQuestionFilter } from "@/lib/testDraft";
import {
  countFailedQuestions,
  discardTestSession,
  getInProgressSession,
  getSessionResult,
  resumeTestSession,
  saveTestDraft,
  startFailedQuestionsSession,
  startRandomTestSession,
  startTopicTestSession,
  submitTestSession,
  type InProgressSession,
  type ResumedTestSession,
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

export async function startFailedQuestionsTest(
  count: number | "all",
  userId?: string,
): Promise<ActionResult<StartedTestSession>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await startFailedQuestionsSession(count, resolvedUserId);
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function startTopicTest(
  topic: string,
  count: number | "all",
  filter: TopicQuestionFilter,
  userId?: string,
): Promise<ActionResult<StartedTestSession>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await startTopicTestSession(
      topic,
      count,
      filter,
      resolvedUserId,
    );
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function saveTestDraftAction(
  sessionId: string,
  draft: TestDraftState,
  userId?: string,
): Promise<ActionResult<void>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    await saveTestDraft(sessionId, resolvedUserId, draft);
    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadInProgressSession(
  userId?: string,
): Promise<InProgressSession | null> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    return await getInProgressSession(resolvedUserId);
  } catch {
    return null;
  }
}

export async function resumeTest(
  sessionId: string,
  userId?: string,
): Promise<ActionResult<ResumedTestSession>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await resumeTestSession(sessionId, resolvedUserId);
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function discardTest(
  sessionId: string,
  userId?: string,
): Promise<ActionResult<void>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    await discardTestSession(sessionId, resolvedUserId);
    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadFailedQuestionsCount(
  userId?: string,
): Promise<number> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    return await countFailedQuestions(resolvedUserId);
  } catch {
    return 0;
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

export async function loadQuestionReviewState(
  questionIds: string[],
  userId?: string,
): Promise<{ bookmarks: QuestionBookmarkMap; notes: QuestionNoteMap }> {
  const resolvedUserId = await resolveUserId(userId);
  const [bookmarks, notes] = await Promise.all([
    getQuestionBookmarks(resolvedUserId, questionIds),
    getQuestionNotes(resolvedUserId, questionIds),
  ]);

  return { bookmarks, notes };
}

export async function toggleBookmarkAction(
  questionId: string,
  bookmarked: boolean,
  userId?: string,
): Promise<ActionResult<void>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    await toggleQuestionBookmark(resolvedUserId, questionId, bookmarked);
    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function saveNoteAction(
  questionId: string,
  note: string,
  userId?: string,
): Promise<ActionResult<void>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    await saveQuestionNote(resolvedUserId, questionId, note);
    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
