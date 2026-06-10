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
      message === "SESSION_NOT_FOUND" ||
      message === "SESSION_ALREADY_COMPLETED" ||
      message === "EMPTY_TEST" ||
      message.startsWith("INSUFFICIENT_QUESTIONS:")
    ) {
      return actionFail(message);
    }

    if (message.includes("Failed to ensure default user")) {
      return actionFail("DEFAULT_USER_SETUP_FAILED");
    }

    if (message.includes("Failed to create test session")) {
      return actionFail("SESSION_CREATE_FAILED");
    }

    if (message.includes("Failed to fetch questions")) {
      return actionFail("QUESTIONS_FETCH_FAILED");
    }

    if (message.includes("Failed to submit")) {
      return actionFail("SUBMIT_FAILED");
    }
  }

  return actionFail("SERVER_ERROR");
}
