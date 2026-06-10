import type { useI18n } from "@/lib/i18n/useI18n";

type TranslateFn = ReturnType<typeof useI18n>["t"];

export function mapTestError(error: unknown, t: TranslateFn): string {
  if (!(error instanceof Error)) {
    return t("common.error");
  }

  const message = error.message;

  if (message === "NO_QUESTIONS_AVAILABLE") {
    return t("test.errorNoQuestions");
  }

  if (message.startsWith("INSUFFICIENT_QUESTIONS:")) {
    const available = message.split(":")[1] ?? "0";
    return t("test.errorInsufficientQuestions", { count: available });
  }

  if (message === "INVALID_QUESTION_COUNT") {
    return t("test.errorInvalidCount");
  }

  if (message === "SESSION_NOT_FOUND") {
    return t("test.errorSessionNotFound");
  }

  if (message === "SESSION_ALREADY_COMPLETED") {
    return t("test.errorSessionCompleted");
  }

  if (message === "EMPTY_TEST") {
    return t("test.errorEmptyTest");
  }

  return message;
}
