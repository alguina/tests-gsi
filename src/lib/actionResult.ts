export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionFail(code: string): ActionResult<never> {
  return { ok: false, code };
}

export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    const message = error.message;

    if (
      message === "INVALID_QUESTION_COUNT" ||
      message === "NO_QUESTIONS_AVAILABLE" ||
      message === "NO_FAILED_QUESTIONS" ||
      message === "NO_TOPIC_QUESTIONS" ||
      message === "SESSION_DRAFT_MISSING" ||
      message === "SESSION_NOT_FOUND" ||
      message === "SESSION_ALREADY_COMPLETED" ||
      message === "ADMIN_ACCESS_DENIED" ||
      message === "EMPTY_TEST" ||
      message === "MISSING_SUPABASE_CONFIG" ||
      message.startsWith("INSUFFICIENT_QUESTIONS:")
    ) {
      return actionFail(message);
    }

    if (message.includes("Failed to ensure default user")) {
      console.error("[test]", message);
      return actionFail("DEFAULT_USER_SETUP_FAILED");
    }

    if (message.includes("Failed to create test session")) {
      console.error("[test]", message);
      return actionFail("SESSION_CREATE_FAILED");
    }

    if (message.includes("Failed to fetch questions")) {
      console.error("[test]", message);
      return actionFail("QUESTIONS_FETCH_FAILED");
    }

    if (message.includes("Failed to count questions")) {
      console.error("[test]", message);
      return actionFail("QUESTIONS_FETCH_FAILED");
    }

    if (message.includes("Failed to fetch answers")) {
      console.error("[test]", message);
      return actionFail("ANSWERS_FETCH_FAILED");
    }

    if (message.includes("Failed to submit")) {
      console.error("[test]", message);
      return actionFail("SUBMIT_FAILED");
    }

    console.error("[test] unmapped error:", message);
  }

  return actionFail("SERVER_ERROR");
}
