import type { useI18n } from "@/lib/i18n/useI18n";

type TranslateFn = ReturnType<typeof useI18n>["t"];

export function mapTestErrorCode(code: string, t: TranslateFn): string {
  if (code === "NO_QUESTIONS_AVAILABLE") {
    return t("test.errorNoQuestions");
  }

  if (code.startsWith("INSUFFICIENT_QUESTIONS:")) {
    const available = code.split(":")[1] ?? "0";
    return t("test.errorInsufficientQuestions", { count: available });
  }

  if (code === "INVALID_QUESTION_COUNT") {
    return t("test.errorInvalidCount");
  }

  if (code === "SESSION_NOT_FOUND") {
    return t("test.errorSessionNotFound");
  }

  if (code === "SESSION_ALREADY_COMPLETED") {
    return t("test.errorSessionCompleted");
  }

  if (code === "EMPTY_TEST") {
    return t("test.errorEmptyTest");
  }

  if (code === "NO_FAILED_QUESTIONS") {
    return t("test.noFailedQuestions");
  }

  if (code === "NO_TOPIC_QUESTIONS") {
    return t("test.noTopicQuestions");
  }

  if (code === "SESSION_DRAFT_MISSING") {
    return t("test.errorSessionDraftMissing");
  }

  if (code === "ACTIVE_SESSION_EXISTS") {
    return t("test.activeSessionPrompt");
  }

  if (code === "MISSING_SUPABASE_CONFIG") {
    return t("test.errorMissingConfig");
  }

  if (code === "DEFAULT_USER_SETUP_FAILED") {
    return t("test.errorDefaultUser");
  }

  if (code === "SESSION_CREATE_FAILED") {
    return t("test.errorSessionCreate");
  }

  if (code === "QUESTIONS_FETCH_FAILED") {
    return t("test.errorQuestionsFetch");
  }

  if (code === "ANSWERS_FETCH_FAILED") {
    return t("test.errorAnswersFetch");
  }

  if (
    code === "SERVER_ERROR" ||
    code === "SUBMIT_FAILED"
  ) {
    return t("test.errorServer");
  }

  if (code.includes("Server Components render")) {
    return t("test.errorServer");
  }

  return code;
}

export function mapTestError(error: unknown, t: TranslateFn): string {
  if (typeof error === "string") {
    return mapTestErrorCode(error, t);
  }

  if (error instanceof Error) {
    return mapTestErrorCode(error.message, t);
  }

  return t("common.error");
}
