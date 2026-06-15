"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  auditQuestionBankAction,
  loadQualityIssuesAction,
  reviewQualityIssueAction,
  setQuestionActiveAction,
} from "@/app/actions/quality";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableWrap,
} from "@/components/ui/Table";
import { useI18n } from "@/lib/i18n/useI18n";
import type { QualityAuditResult, QualityFlagType, QualityIssue } from "@/lib/quality/types";
import { QUALITY_FLAG_TYPES } from "@/lib/quality/types";

type DataQualityPageContentProps = {
  gate: { configured: boolean; authorized: boolean };
};

export function DataQualityPageContent({ gate }: DataQualityPageContentProps) {
  const { t } = useI18n();
  const [audit, setAudit] = useState<QualityAuditResult | null>(null);
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [flagType, setFlagType] = useState<string>("all");
  const [reviewedFilter, setReviewedFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = useCallback(async () => {
    const result = await loadQualityIssuesAction({
      flagType: flagType === "all" ? undefined : (flagType as QualityFlagType),
      reviewed:
        reviewedFilter === "all"
          ? undefined
          : reviewedFilter === "reviewed",
      page,
      pageSize: 25,
    });

    if (result.ok) {
      setIssues(result.data.issues);
      setTotal(result.data.total);
    }
  }, [flagType, page, reviewedFilter]);

  useEffect(() => {
    if (gate.authorized) {
      void loadIssues();
    }
  }, [gate.authorized, loadIssues]);

  async function handleRunAudit() {
    setIsRunning(true);
    setError(null);
    const result = await auditQuestionBankAction();

    if (!result.ok) {
      setError(
        result.code === "ADMIN_ACCESS_DENIED"
          ? t("admin.accessDenied")
          : t("quality.runAuditFailed"),
      );
      setIsRunning(false);
      return;
    }

    setAudit(result.data);
    setPage(1);
    await loadIssues();
    setIsRunning(false);
  }

  async function handleReview(issue: QualityIssue, reviewed: boolean) {
    if (!issue.questionId) {
      return;
    }

    await reviewQualityIssueAction(issue.questionId, issue.flagType, reviewed);
    await loadIssues();
  }

  async function handleToggleActive(issue: QualityIssue) {
    if (!issue.questionId) {
      return;
    }

    await setQuestionActiveAction(issue.questionId, !(issue.isActive ?? true));
    await loadIssues();
  }

  const summary = audit?.summary;

  const issueCountEntries = useMemo(
    () =>
      Object.entries(summary?.issueCounts ?? {}).sort(
        (left, right) => right[1] - left[1],
      ),
    [summary?.issueCounts],
  );

  if (!gate.authorized) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow={t("quality.eyebrow")}
          title={t("quality.title")}
          description={t("admin.accessRequired")}
        />
        <Button href="/admin/access?next=/admin/quality">{t("admin.unlock")}</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("quality.eyebrow")}
        title={t("quality.title")}
        description={t("quality.description")}
        actions={
          <Button onClick={() => void handleRunAudit()} disabled={isRunning}>
            {isRunning ? t("quality.runningAudit") : t("quality.runAudit")}
          </Button>
        }
      />

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-sm text-text-muted">{t("quality.totalQuestions")}</p>
            <p className="mt-1 text-2xl font-semibold">{summary.totalQuestions}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">{t("quality.activeQuestions")}</p>
            <p className="mt-1 text-2xl font-semibold">{summary.activeQuestions}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">{t("quality.unreviewedIssues")}</p>
            <p className="mt-1 text-2xl font-semibold">{summary.unreviewedCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">{t("quality.lastAudited")}</p>
            <p className="mt-1 text-sm font-semibold">
              {new Date(summary.lastAuditedAt).toLocaleString()}
            </p>
          </Card>
        </section>
      ) : null}

      {issueCountEntries.length ? (
        <Card as="section" className="mt-6">
          <h2 className="text-base font-medium tracking-tight text-text-primary">{t("quality.issueSummary")}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {issueCountEntries.map(([type, count]) => (
              <li key={type} className="rounded-md bg-surface-muted px-3 py-2 text-sm">
                <span className="font-medium">{t(`quality.flag.${type}`)}</span>
                <span className="float-right font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card as="section" className="mt-6">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            {t("quality.filterType")}
            <Select
              value={flagType}
              onChange={(event) => {
                setFlagType(event.target.value);
                setPage(1);
              }}
              className="mt-1"
            >
              <option value="all">{t("quality.allTypes")}</option>
              {QUALITY_FLAG_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`quality.flag.${type}`)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm">
            {t("quality.filterReviewed")}
            <Select
              value={reviewedFilter}
              onChange={(event) => {
                setReviewedFilter(event.target.value);
                setPage(1);
              }}
              className="mt-1"
            >
              <option value="all">{t("quality.allReviewStates")}</option>
              <option value="unreviewed">{t("quality.unreviewed")}</option>
              <option value="reviewed">{t("quality.reviewed")}</option>
            </Select>
          </label>
        </div>

        <TableWrap className="mt-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>{t("quality.issueType")}</TableCell>
                <TableCell header>{t("quality.question")}</TableCell>
                <TableCell header>{t("quality.source")}</TableCell>
                <TableCell header>{t("quality.severity")}</TableCell>
                <TableCell header>{t("quality.status")}</TableCell>
                <TableCell header>{t("quality.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.map((issue, index) => (
                <TableRow key={`${issue.questionId ?? "none"}-${issue.flagType}-${index}`}>
                  <TableCell>{t(`quality.flag.${issue.flagType}`)}</TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate">{issue.questionText ?? t("common.dash")}</p>
                    {issue.topic ? (
                      <p className="text-xs text-text-muted">{issue.topic}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>{issue.sourceTitle ?? t("common.dash")}</TableCell>
                  <TableCell>{issue.severity}</TableCell>
                  <TableCell>
                    {issue.reviewed ? t("quality.reviewed") : t("quality.unreviewed")}
                    {issue.isActive === false ? ` · ${t("quality.excluded")}` : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {issue.questionId ? (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => void handleReview(issue, !issue.reviewed)}
                          >
                            {issue.reviewed
                              ? t("quality.markUnreviewed")
                              : t("quality.markReviewed")}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => void handleToggleActive(issue)}
                          >
                            {issue.isActive === false
                              ? t("quality.includeInTests")
                              : t("quality.excludeFromTests")}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            {t("quality.pagination", { page, total })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {t("quality.previousPage")}
            </Button>
            <Button
              variant="secondary"
              disabled={page * 25 >= total}
              onClick={() => setPage((current) => current + 1)}
            >
              {t("quality.nextPage")}
            </Button>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Card>
    </PageContainer>
  );
}
