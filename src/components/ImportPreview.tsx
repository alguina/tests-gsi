"use client";

import { useMemo, useState } from "react";
import { importFromPreparaticUrl } from "@/app/actions/importPreparatic";
import { saveTestToDatabase } from "@/app/actions/saveTest";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Input";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  parsePreparaticTest,
  type ParsedTest,
} from "@/lib/preparaticParser";
import { preparaticSample } from "@/lib/preparaticSample";
import type { SaveTestResult } from "@/lib/saveParsedTest";
import { cn } from "@/lib/ui/cn";
import { useI18n } from "@/lib/i18n/useI18n";

export function ImportPreview() {
  const { t } = useI18n();
  const [rawInput, setRawInput] = useState(preparaticSample);
  const [importUrl, setImportUrl] = useState("");
  const [parsedTest, setParsedTest] = useState<ParsedTest | null>(null);
  const [importSourceUrl, setImportSourceUrl] = useState<string | null>(null);
  const [importAssetUrl, setImportAssetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<SaveTestResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const summary = useMemo(() => {
    if (!parsedTest) {
      return null;
    }

    const answerCount = parsedTest.questions.reduce(
      (total, question) => total + question.answers.length,
      0,
    );
    const questionsWithCorrectAnswer = parsedTest.questions.filter(
      (question) => question.correctLetter,
    ).length;

    return {
      answerCount,
      questionsWithCorrectAnswer,
    };
  }, [parsedTest]);

  function resetImportState() {
    setImportSourceUrl(null);
    setImportAssetUrl(null);
    setImportError(null);
    setSaveError(null);
    setSaveResult(null);
  }

  function handleParse() {
    try {
      const result = parsePreparaticTest(rawInput);
      setParsedTest(result);
      setError(null);
      resetImportState();
    } catch (parseError) {
      setParsedTest(null);
      resetImportState();
      setError(
        parseError instanceof Error
          ? parseError.message
          : t("import.parseFailed"),
      );
    }
  }

  async function handleImportFromUrl() {
    setIsImporting(true);
    setImportError(null);
    setError(null);
    setSaveError(null);
    setSaveResult(null);

    try {
      const result = await importFromPreparaticUrl(importUrl);
      setRawInput(result.rawJs);
      setParsedTest(result.parsedTest);
      setImportSourceUrl(result.sourceUrl);
      setImportAssetUrl(result.assetUrl);
    } catch (importFailure) {
      setParsedTest(null);
      setImportSourceUrl(null);
      setImportAssetUrl(null);
      setImportError(
        importFailure instanceof Error
          ? importFailure.message
          : t("import.urlImportFailed"),
      );
    } finally {
      setIsImporting(false);
    }
  }

  async function handleSave() {
    if (!parsedTest) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveResult(null);

    try {
      const result = await saveTestToDatabase(parsedTest);
      setSaveResult(result);
    } catch (saveFailure) {
      setSaveError(
        saveFailure instanceof Error
          ? saveFailure.message
          : t("import.saveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-text-primary">
          {t("import.singleTestImport")}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t("import.singleTestImportDescription")}
        </p>
        <FieldLabel htmlFor="import-url" className="mt-4">
          {t("import.urlLabel")}
        </FieldLabel>
        <Input
          id="import-url"
          type="url"
          value={importUrl}
          onChange={(event) => setImportUrl(event.target.value)}
          placeholder={t("import.urlPlaceholder")}
          className="mt-3"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleImportFromUrl}
            disabled={isImporting || !importUrl.trim()}
          >
            {isImporting ? t("import.importing") : t("import.importFromUrl")}
          </Button>
        </div>
        {importError ? (
          <Card tone="danger" padding="sm" className="mt-4 shadow-none">
            {importError}
          </Card>
        ) : null}
        {importAssetUrl ? (
          <Card tone="success" padding="sm" className="mt-4 shadow-none">
            {t("import.loadedAsset")}{" "}
            <span className="break-all font-medium">{importAssetUrl}</span>
            {importSourceUrl && importSourceUrl !== importAssetUrl ? (
              <>
                <br />
                {t("import.sourceUrl")}{" "}
                <span className="break-all font-medium">{importSourceUrl}</span>
              </>
            ) : null}
          </Card>
        ) : null}
      </Card>

      <Card>
        <SectionHeader
          title={t("import.discoverTests")}
          description={t("import.discoverTestsDescription")}
          action={
            <Button href="/discover" variant="secondary">
              {t("import.openBulkImport")}
            </Button>
          }
        />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary">
          {t("import.manualPaste")}
        </h2>
        <FieldLabel htmlFor="raw-js" className="mt-4">
          {t("import.rawJsLabel")}
        </FieldLabel>
        <Textarea
          id="raw-js"
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          spellCheck={false}
          className="mt-3"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleParse}>{t("import.parseTest")}</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRawInput(preparaticSample);
              setParsedTest(null);
              setError(null);
              resetImportState();
            }}
          >
            {t("import.resetSample")}
          </Button>
        </div>
        {error ? (
          <Card tone="danger" padding="sm" className="mt-4 shadow-none">
            {error}
          </Card>
        ) : null}
      </Card>

      {parsedTest && summary ? (
        <section className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold text-text-primary">
              {t("import.preview")}
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label={t("import.previewTitle")}
                value={parsedTest.title ?? t("import.untitledTest")}
                size="sm"
              />
              <StatCard
                label={t("import.previewQuestions")}
                value={parsedTest.questions.length}
                size="sm"
              />
              <StatCard
                label={t("import.previewAnswers")}
                value={summary.answerCount}
                size="sm"
              />
              <StatCard
                label={t("import.previewWithCorrect")}
                value={summary.questionsWithCorrectAnswer}
                size="sm"
              />
            </dl>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="success"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? t("import.saving") : t("import.saveToDatabase")}
              </Button>
            </div>

            {saveError ? (
              <Card tone="danger" padding="sm" className="mt-4 shadow-none">
                {saveError}
              </Card>
            ) : null}

            {saveResult ? (
              <Card tone="success" padding="sm" className="mt-4 shadow-none">
                <p className="font-semibold">{t("import.importResult")}</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    {t("import.sourceStatus", {
                      status: saveResult.source,
                      id: saveResult.sourceExternalId,
                    })}
                  </li>
                  <li>
                    {t("import.questionsInserted")} {saveResult.questionsInserted}
                  </li>
                  <li>
                    {t("import.questionsUpdated")} {saveResult.questionsUpdated}
                  </li>
                  <li>
                    {t("import.questionsSkipped")} {saveResult.questionsSkipped}
                  </li>
                  <li>
                    {t("import.answersInserted")} {saveResult.answersInserted}
                  </li>
                  <li>
                    {t("import.answersUpdated")} {saveResult.answersUpdated}
                  </li>
                </ul>
              </Card>
            ) : null}
          </Card>

          <div className="space-y-4">
            {parsedTest.questions.map((question, questionIndex) => (
              <Card key={question.externalId ?? `${question.text}-${questionIndex}`} as="article">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-text-secondary">
                    {questionIndex + 1}
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold leading-7 text-text-primary">
                      {question.text}
                    </h3>
                    <QuestionMetadata question={question} />
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {question.answers.map((answer) => (
                    <li
                      key={`${question.externalId ?? questionIndex}-${answer.letter}`}
                      className={cn(
                        "rounded-xl border p-3 text-sm leading-6",
                        answer.isCorrect
                          ? "border-emerald-300 bg-success-muted text-emerald-950"
                          : "border-border bg-surface-muted text-text-primary",
                      )}
                    >
                      <span className="font-semibold">{answer.letter}.</span>{" "}
                      {answer.text}
                      {answer.isCorrect ? (
                        <Badge variant="success" className="ml-2">
                          {t("common.correct")}
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function QuestionMetadata({
  question,
}: {
  question: ParsedTest["questions"][number];
}) {
  const metadata = [
    question.block,
    question.topic,
    question.year,
    question.exam,
  ].filter(Boolean);

  if (!metadata.length) {
    return null;
  }

  return (
    <p className="text-sm text-text-muted">
      {metadata.map(String).join(" / ")}
    </p>
  );
}
