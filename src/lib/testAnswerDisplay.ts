import type { TestAnswer } from "@/lib/testSession";

export function getAnswerTextByLetter(
  answers: TestAnswer[],
  letter: string | null | undefined,
): string | null {
  if (!letter) {
    return null;
  }

  return answers.find((answer) => answer.letter === letter)?.text ?? null;
}
