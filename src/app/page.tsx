"use client";

import { useMemo, useState } from "react";
import { preparaticSample } from "@/fixtures/preparaticSample";
import {
  parsePreparaticTest,
  type ParsedQuestion,
  type ParsedTest,
} from "@/lib/preparaticParser";

type Summary = {
  questionCount: number;
  answerCount: number;
  questionsWithCorrectAnswer: number;
};

export default function Home() {
  const [rawInput, setRawInput] = useState(preparaticSample);
  const [parsedTest, setParsedTest] = useState<ParsedTest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(
    () => (parsedTest ? buildSummary(parsedTest) : null),
    [parsedTest],
  );

  function handleParse() {
    try {
      setError(null);
      setParsedTest(parsePreparaticTest(rawInput));
    } catch (caughtError) {
      setParsedTest(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Parsing failed. Check the pasted JavaScript and try again.",
      );
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            GSI A2 study parser
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Preparatic import preview
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Paste a raw Preparatic JavaScript bundle, parse it locally, and
            review the extracted questions before any future import work.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="raw-js"
                className="text-sm font-semibold text-slate-900"
              >
                Raw JavaScript content
              </label>
              <button
                type="button"
                onClick={() => setRawInput(preparaticSample)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Load sample
              </button>
            </div>

            <textarea
              id="raw-js"
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              className="min-h-72 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none ring-blue-500 transition focus:border-blue-500 focus:ring-2"
              spellCheck={false}
            />

            <button
              type="button"
              onClick={handleParse}
              className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:self-start"
            >
              Parse test
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        {parsedTest && summary ? (
          <Preview parsedTest={parsedTest} summary={summary} />
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
            Parsed questions will appear here after you click{" "}
            <span className="font-semibold text-slate-700">Parse test</span>.
          </section>
        )}
      </div>
    </main>
  );
}

function Preview({
  parsedTest,
  summary,
}: {
  parsedTest: ParsedTest;
  summary: Summary;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">Parsed test</p>
          <h2 className="text-xl font-semibold text-slate-950">
            {parsedTest.title ?? "Untitled test"}
          </h2>
          {parsedTest.externalId ? (
            <p className="text-sm text-slate-500">ID: {parsedTest.externalId}</p>
          ) : null}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryItem label="Questions" value={summary.questionCount} />
          <SummaryItem label="Answers" value={summary.answerCount} />
          <SummaryItem
            label="With correct"
            value={summary.questionsWithCorrectAnswer}
          />
          <SummaryItem
            label="Missing correct"
            value={summary.questionCount - summary.questionsWithCorrectAnswer}
          />
        </dl>
      </div>

      <div className="space-y-3">
        {parsedTest.questions.map((question, index) => (
          <QuestionCard
            key={`${question.externalId ?? question.text}-${index}`}
            question={question}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function QuestionCard({
  question,
  index,
}: {
  question: ParsedQuestion;
  index: number;
}) {
  const metadata = [
    question.block,
    question.topic,
    question.year ? String(question.year) : undefined,
    question.exam,
  ].filter(Boolean);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question {index + 1}
          </p>
          {question.correctLetter ? (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              Correct: {question.correctLetter}
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              No correct answer
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold leading-7 text-slate-950">
          {question.text}
        </h3>

        {metadata.length ? (
          <p className="text-xs text-slate-500">{metadata.join(" / ")}</p>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2">
        {question.answers.map((answer) => (
          <li
            key={`${answer.letter}-${answer.text}`}
            className={`rounded-xl border p-3 text-sm ${
              answer.isCorrect
                ? "border-green-300 bg-green-50 text-green-950"
                : "border-slate-200 bg-slate-50 text-slate-800"
            }`}
          >
            <div className="flex gap-3">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">
                {answer.letter}
              </span>
              <span className="leading-6">
                {answer.text}
                {answer.isCorrect ? (
                  <span className="ml-2 font-semibold text-green-700">
                    Correct
                  </span>
                ) : null}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function buildSummary(parsedTest: ParsedTest): Summary {
  return {
    questionCount: parsedTest.questions.length,
    answerCount: parsedTest.questions.reduce(
      (total, question) => total + question.answers.length,
      0,
    ),
    questionsWithCorrectAnswer: parsedTest.questions.filter((question) =>
      Boolean(question.correctLetter),
    ).length,
  };
}
