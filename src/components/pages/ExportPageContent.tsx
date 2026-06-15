"use client";

import { useEffect, useState } from "react";
import {
  generateMarkdownExportAction,
  listExportTopicsAction,
} from "@/app/actions/export";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ExportType } from "@/lib/exports/types";

const EXPORT_TYPES: ExportType[] = [
  "weekly_report",
  "errors_by_topic",
  "study_material",
  "bookmarks",
  "progress_snapshot",
];

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 7);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function ExportPageContent() {
  const { t } = useI18n();
  const { profile } = useProfile();
  const initialRange = defaultDateRange();
  const [exportType, setExportType] = useState<ExportType>("weekly_report");
  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);
  const [topic, setTopic] = useState("");
  const [studyGoal, setStudyGoal] = useState("");
  const [topics, setTopics] = useState<Array<{ topic: string; topicTitle: string | null }>>(
    [],
  );
  const [preview, setPreview] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void listExportTopicsAction(profile?.id).then(setTopics);
  }, [profile?.id]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setCopied(false);

    const result = await generateMarkdownExportAction({
      type: exportType,
      userId: profile?.id,
      from: fromDate ? new Date(`${fromDate}T00:00:00.000Z`).toISOString() : undefined,
      to: toDate ? new Date(`${toDate}T23:59:59.999Z`).toISOString() : undefined,
      topic: topic || undefined,
      studyGoal: studyGoal || undefined,
    });

    if (!result.ok) {
      setError(t("export.generateFailed"));
      setIsGenerating(false);
      return;
    }

    setPreview(result.data.markdown);
    setFilename(result.data.filename);
    setIsGenerating(false);
  }

  function handleDownload() {
    if (!preview) {
      return;
    }

    const blob = new Blob([preview], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename || "gsi-export.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    if (!preview) {
      return;
    }

    await navigator.clipboard.writeText(preview);
    setCopied(true);
  }

  const showDateRange =
    exportType === "weekly_report" || exportType === "progress_snapshot";
  const showTopic =
    exportType === "errors_by_topic" || exportType === "study_material";
  const showGoal = exportType === "study_material";

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("export.eyebrow")}
        title={t("export.title")}
        description={t("export.description")}
      />

      <Card as="section" className="max-w-3xl">
        <label className="block text-sm font-medium text-text-primary">
          {t("export.type")}
          <Select
            value={exportType}
            onChange={(event) => setExportType(event.target.value as ExportType)}
            className="mt-2"
          >
            {EXPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`export.type.${type}`)}
              </option>
            ))}
          </Select>
        </label>

        {showDateRange ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-text-primary">
              {t("export.fromDate")}
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="mt-2"
              />
            </label>
            <label className="block text-sm font-medium text-text-primary">
              {t("export.toDate")}
              <Input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="mt-2"
              />
            </label>
          </div>
        ) : null}

        {showTopic ? (
          <label className="mt-4 block text-sm font-medium text-text-primary">
            {t("export.topic")}
            <Select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2"
            >
              <option value="">{t("export.allTopics")}</option>
              {topics.map((item) => (
                <option key={item.topic} value={item.topic}>
                  {item.topicTitle
                    ? `${item.topic} — ${item.topicTitle}`
                    : item.topic}
                </option>
              ))}
            </Select>
          </label>
        ) : null}

        {showGoal ? (
          <label className="mt-4 block text-sm font-medium text-text-primary">
            {t("export.studyGoal")}
            <Input
              value={studyGoal}
              onChange={(event) => setStudyGoal(event.target.value)}
              placeholder={t("export.studyGoalPlaceholder")}
              className="mt-2"
            />
          </label>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => void handleGenerate()} disabled={isGenerating}>
            {isGenerating ? t("export.generating") : t("export.preview")}
          </Button>
          <Button variant="secondary" onClick={handleDownload} disabled={!preview}>
            {t("export.download")}
          </Button>
          <Button variant="secondary" onClick={() => void handleCopy()} disabled={!preview}>
            {copied ? t("export.copied") : t("export.copy")}
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Card>

      {preview ? (
        <Card as="section" className="mt-6">
          <h2 className="text-base font-medium tracking-tight text-text-primary">{t("export.previewTitle")}</h2>
          <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md bg-surface-muted p-4 text-sm text-text-primary">
            {preview}
          </pre>
        </Card>
      ) : null}
    </PageContainer>
  );
}
