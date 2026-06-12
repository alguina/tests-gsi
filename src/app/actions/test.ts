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
  getExamSessionResult,
  getInProgressSession,
  getSessionResult,
  resumeTestSession,
  saveTestDraft,
  startExamSimulationSession,
  startFailedQuestionsSession,
  startRandomTestSession,
  startRecommendedTestSession,
  startTopicTestSession,
  submitTestSession,
  type ExamTestResult,
  type InProgressSession,
  type ResumedTestSession,
  type StartedTestSession,
  type TestQuestion,
  type TestResult,
  type TestSelection,
} from "@/lib/testSession";
import { buildStudyRecommendation } from "@/lib/recommendations";
import type { StudyRecommendation } from "@/lib/recommendations";

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

export async function startRecommendedTest(
  count: number,
  userId?: string,
): Promise<ActionResult<StartedTestSession>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await startRecommendedTestSession(count, resolvedUserId);
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function startExamSimulation(
  questionCount: number,
  timeLimitSeconds: number,
  userId?: string,
): Promise<ActionResult<StartedTestSession>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await startExamSimulationSession(
      questionCount,
      timeLimitSeconds,
      resolvedUserId,
    );
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadStudyRecommendation(
  userId?: string,
  count?: number,
): Promise<StudyRecommendation | null> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    return await buildStudyRecommendation(resolvedUserId, count);
  } catch {
    return null;
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
  durationSeconds?: number,
): Promise<ActionResult<TestResult>> {
  try {
    const resolvedUserId = await resolveUserId(userId);
    const data = await submitTestSession(
      sessionId,
      questions,
      selections,
      resolvedUserId,
      durationSeconds !== undefined ? { durationSeconds } : undefined,
    );
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadExamSessionResult(
  sessionId: string,
): Promise<ExamTestResult | null> {
  try {
    const cookieStore = await cookies();
    const userId =
      cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
    return await getExamSessionResult(sessionId, userId);
  } catch {
    return null;
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
