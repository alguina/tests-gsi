"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableWrap,
} from "@/components/ui/Table";
import { useI18n } from "@/lib/i18n/useI18n";
import type {
  BlockTopicCombinationRow,
  MetadataFrequencyRow,
  TopicMetadataDiagnostics,
  TopicMetadataExampleRow,
} from "@/lib/topicMetadataDiagnostics";
import { typography } from "@/lib/ui/tokens";

type TopicMetadataDiagnosticsPageContentProps = {
  diagnostics?: TopicMetadataDiagnostics;
};

type CsvRow = Record<string, string | number | readonly string[]>;

function csvEscape(value: string | number | readonly string[]): string {
  const normalized = Array.isArray(value) ? value.join(" | ") : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function toCsv(rows: CsvRow[]): string {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

function CopyCsvButton({ rows }: { rows: CsvRow[] }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(toCsv(rows));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button variant="subtle" size="sm" onClick={() => void handleCopy()}>
      {copied ? t("topicDiagnostics.copied") : t("topicDiagnostics.copyCsv")}
    </Button>
  );
}

function SectionHeader({
  title,
  description,
  rows,
}: {
  title: string;
  description?: string;
  rows: CsvRow[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className={typography.sectionTitle}>{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      <CopyCsvButton rows={rows} />
    </div>
  );
}

function FrequencyTable({
  title,
  description,
  valueLabel,
  rows,
}: {
  title: string;
  description?: string;
  valueLabel: string;
  rows: MetadataFrequencyRow[];
}) {
  const { t } = useI18n();
  const csvRows = rows.map((row) => ({
    [valueLabel]: row.value,
    [t("topicDiagnostics.count")]: row.count,
  }));

  return (
    <Card as="section">
      <SectionHeader title={title} description={description} rows={csvRows} />
      <TableWrap className="mt-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>{valueLabel}</TableCell>
              <TableCell header>{t("topicDiagnostics.count")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.value}>
                <TableCell>{row.value}</TableCell>
                <TableCell>{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrap>
    </Card>
  );
}

function BlockTopicTable({ rows }: { rows: BlockTopicCombinationRow[] }) {
  const { t } = useI18n();
  const csvRows = rows.map((row) => ({
    [t("topicDiagnostics.block")]: row.block,
    [t("topicDiagnostics.topic")]: row.topic,
    [t("topicDiagnostics.count")]: row.count,
  }));

  return (
    <Card as="section">
      <SectionHeader
        title={t("topicDiagnostics.blockTopicTitle")}
        description={t("topicDiagnostics.blockTopicDescription")}
        rows={csvRows}
      />
      <TableWrap className="mt-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>{t("topicDiagnostics.block")}</TableCell>
              <TableCell header>{t("topicDiagnostics.topic")}</TableCell>
              <TableCell header>{t("topicDiagnostics.count")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.block}-${row.topic}`}>
                <TableCell>{row.block}</TableCell>
                <TableCell>{row.topic}</TableCell>
                <TableCell>{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrap>
    </Card>
  );
}

function ExampleTable({ rows }: { rows: TopicMetadataExampleRow[] }) {
  const { t } = useI18n();
  const csvRows = rows.map((row) => ({
    [t("topicDiagnostics.block")]: row.block,
    [t("topicDiagnostics.topic")]: row.topic,
    [t("topicDiagnostics.exam")]: row.exam,
    [t("topicDiagnostics.year")]: row.year,
    [t("topicDiagnostics.sourceTitle")]: row.sourceTitle,
    [t("topicDiagnostics.sourceType")]: row.sourceType,
    [t("topicDiagnostics.count")]: row.count,
    [t("topicDiagnostics.examples")]: row.examples,
  }));

  return (
    <Card as="section">
      <SectionHeader
        title={t("topicDiagnostics.examplesTitle")}
        description={t("topicDiagnostics.examplesDescription")}
        rows={csvRows}
      />
      <TableWrap className="mt-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>{t("topicDiagnostics.block")}</TableCell>
              <TableCell header>{t("topicDiagnostics.topic")}</TableCell>
              <TableCell header>{t("topicDiagnostics.exam")}</TableCell>
              <TableCell header>{t("topicDiagnostics.year")}</TableCell>
              <TableCell header>{t("topicDiagnostics.sourceTitle")}</TableCell>
              <TableCell header>{t("topicDiagnostics.sourceType")}</TableCell>
              <TableCell header>{t("topicDiagnostics.count")}</TableCell>
              <TableCell header>{t("topicDiagnostics.examples")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={[
                  row.block,
                  row.topic,
                  row.exam,
                  row.year,
                  row.sourceTitle,
                  row.sourceType,
                ].join("-")}
              >
                <TableCell>{row.block}</TableCell>
                <TableCell>{row.topic}</TableCell>
                <TableCell>{row.exam}</TableCell>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.sourceTitle}</TableCell>
                <TableCell>{row.sourceType}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell>
                  <ol className="max-w-xl list-decimal space-y-2 pl-4 text-sm leading-6 text-text-secondary">
                    {row.examples.map((example, index) => (
                      <li key={`${row.block}-${row.topic}-${index}`}>
                        {example}
                      </li>
                    ))}
                  </ol>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrap>
    </Card>
  );
}

export function TopicMetadataDiagnosticsPageContent({
  diagnostics,
}: TopicMetadataDiagnosticsPageContentProps) {
  const { t } = useI18n();

  if (!diagnostics) {
    return (
      <PageContainer>
        <PageHeader
          backLink={{ href: "/more", label: t("topicDiagnostics.backToMore") }}
          eyebrow={t("topicDiagnostics.eyebrow")}
          title={t("topicDiagnostics.title")}
          description={t("admin.accessRequired")}
        />
        <Button href="/admin/access?next=/admin/topic-diagnostics">
          {t("admin.unlock")}
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="full">
      <PageHeader
        backLink={{ href: "/more", label: t("topicDiagnostics.backToMore") }}
        eyebrow={t("topicDiagnostics.eyebrow")}
        title={t("topicDiagnostics.title")}
        description={t("topicDiagnostics.description", {
          count: diagnostics.totalQuestions,
        })}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <FrequencyTable
          title={t("topicDiagnostics.blocksTitle")}
          description={t("topicDiagnostics.blocksDescription")}
          valueLabel={t("topicDiagnostics.block")}
          rows={diagnostics.blockValues}
        />
        <FrequencyTable
          title={t("topicDiagnostics.topicsTitle")}
          description={t("topicDiagnostics.topicsDescription")}
          valueLabel={t("topicDiagnostics.topic")}
          rows={diagnostics.topicValues}
        />
        <BlockTopicTable rows={diagnostics.blockTopicCombinations} />
        <FrequencyTable
          title={t("topicDiagnostics.examsTitle")}
          valueLabel={t("topicDiagnostics.exam")}
          rows={diagnostics.examValues}
        />
        <FrequencyTable
          title={t("topicDiagnostics.sourceTitlesTitle")}
          valueLabel={t("topicDiagnostics.sourceTitle")}
          rows={diagnostics.sourceTitles}
        />
        <FrequencyTable
          title={t("topicDiagnostics.sourceTypesTitle")}
          valueLabel={t("topicDiagnostics.sourceType")}
          rows={diagnostics.sourceTypes}
        />
        <FrequencyTable
          title={t("topicDiagnostics.yearsTitle")}
          valueLabel={t("topicDiagnostics.year")}
          rows={diagnostics.yearValues}
        />
      </section>

      <ExampleTable rows={diagnostics.examplesByCombination} />
    </PageContainer>
  );
}
