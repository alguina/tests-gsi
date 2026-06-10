"use client";

import { useMemo, useRef, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableWrap,
} from "@/components/ui/Table";
import {
  fetchDatabaseStats,
  importDiscoveredPreparaticTest,
} from "@/app/actions/bulkImport";
import { discoverPreparaticTestIndex } from "@/app/actions/discoverPreparatic";
import type { DatabaseStats } from "@/lib/databaseStats";
import {
  selectImportBatch,
  sleep,
  type BulkImportTestLog,
} from "@/lib/preparaticBulkImport";
import type {
  DiscoveredTest,
  PreparaticDiscoveryResult,
} from "@/lib/preparaticDiscovery";

type ImportProgress = {
  isRunning: boolean;
  currentIndex: number;
  selectedTotal: number;
  currentTitle: string;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  dryRunCount: number;
  questionsProcessed: number;
  answersProcessed: number;
  statusMessage: string;
  logs: BulkImportTestLog[];
  startedAt: string | null;
  finishedAt: string | null;
};

const INITIAL_PROGRESS: ImportProgress = {
  isRunning: false,
  currentIndex: 0,
  selectedTotal: 0,
  currentTitle: "",
  importedCount: 0,
  skippedCount: 0,
  failedCount: 0,
  dryRunCount: 0,
  questionsProcessed: 0,
  answersProcessed: 0,
  statusMessage: "",
  logs: [],
  startedAt: null,
  finishedAt: null,
};

export default function DiscoverPage() {
  const [result, setResult] = useState<PreparaticDiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [limit, setLimit] = useState(20);
  const [delayMs, setDelayMs] = useState(750);
  const [progress, setProgress] = useState<ImportProgress>(INITIAL_PROGRESS);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const cancelRef = useRef(false);

  const importDiagnostics = useMemo(() => {
    if (!result) {
      return null;
    }

    const withAssetUrl = result.tests.filter((test) => test.assetUrl).length;
    const importedCount = result.tests.filter(
      (test) => test.importStatus === "imported",
    ).length;
    const remainingCount = result.tests.filter(
      (test) => test.assetUrl && test.importStatus === "not_imported",
    ).length;

    return {
      discoveredCount: result.tests.length,
      withAssetUrl,
      importedCount,
      remainingCount,
    };
  }, [result]);

  const visibleTests = (result?.tests ?? []).filter((test) => {
    if (typeFilter !== "all" && test.type !== typeFilter) {
      return false;
    }

    if (statusFilter !== "all" && test.importStatus !== statusFilter) {
      return false;
    }

    return true;
  });

  const types = result
    ? [...new Set(result.tests.map((test) => test.type))].sort()
    : [];

  async function handleDiscover() {
    setIsDiscovering(true);
    setError(null);

    try {
      const discovery = await discoverPreparaticTestIndex();
      setResult(discovery);
    } catch (discoveryError) {
      setResult(null);
      setError(
        discoveryError instanceof Error
          ? discoveryError.message
          : "Failed to discover tests.",
      );
    } finally {
      setIsDiscovering(false);
    }
  }

  async function handleRefreshDatabaseCounts() {
    setIsLoadingStats(true);

    try {
      const stats = await fetchDatabaseStats();
      setDatabaseStats(stats);
    } catch (statsError) {
      setError(
        statsError instanceof Error
          ? statsError.message
          : "Failed to load database counts.",
      );
    } finally {
      setIsLoadingStats(false);
    }
  }

  function markTestImported(hash: string) {
    setResult((current) => {
      if (!current) {
        return current;
      }

      const tests = current.tests.map((test) =>
        test.hash === hash
          ? { ...test, importStatus: "imported" as const }
          : test,
      );
      const importedCount = tests.filter(
        (test) => test.importStatus === "imported",
      ).length;

      return {
        ...current,
        tests,
        diagnostics: {
          ...current.diagnostics,
          importedCount,
          notImportedCount: tests.length - importedCount,
        },
      };
    });
  }

  function appendLog(log: BulkImportTestLog) {
    setProgress((current) => ({
      ...current,
      logs: [log, ...current.logs],
      importedCount:
        current.importedCount + (log.status === "imported" ? 1 : 0),
      skippedCount: current.skippedCount + (log.status === "skipped" ? 1 : 0),
      failedCount: current.failedCount + (log.status === "failed" ? 1 : 0),
      dryRunCount: current.dryRunCount + (log.status === "dry_run_ok" ? 1 : 0),
      questionsProcessed:
        current.questionsProcessed + log.questionsDetected,
      answersProcessed: current.answersProcessed + log.answersDetected,
    }));
  }

  async function importTestWithRetry(
    test: DiscoveredTest,
    isDryRun: boolean,
  ): Promise<BulkImportTestLog> {
    const input = {
      hash: test.hash,
      title: test.title,
      assetUrl: test.assetUrl!,
      dryRun: isDryRun,
    };

    let log = await importDiscoveredPreparaticTest(input);

    if (log.status === "failed") {
      await sleep(2000);
      log = await importDiscoveredPreparaticTest(input);
    }

    return log;
  }

  async function runBulkImport(isDryRun = false) {
    if (!result) {
      return;
    }

    const batch = selectImportBatch(result.tests, {
      limit,
      skipAlreadyImported: true,
    });

    if (!batch.length) {
      setProgress((current) => ({
        ...current,
        statusMessage: "No tests selected for import.",
      }));
      return;
    }

    cancelRef.current = false;
    const startedAt = new Date().toISOString();

    setProgress({
      ...INITIAL_PROGRESS,
      isRunning: true,
      selectedTotal: batch.length,
      startedAt,
      statusMessage: isDryRun
        ? "Starting dry run batch..."
        : "Starting bulk import batch...",
    });

    for (const [index, test] of batch.entries()) {
      if (cancelRef.current) {
        setProgress((current) => ({
          ...current,
          isRunning: false,
          finishedAt: new Date().toISOString(),
          statusMessage: `Import cancelled after ${index} of ${batch.length} tests.`,
        }));
        if (!isDryRun) {
          await handleRefreshDatabaseCounts();
        }
        return;
      }

      if (test.importStatus === "imported") {
        const skippedLog: BulkImportTestLog = {
          timestamp: new Date().toISOString(),
          title: test.title,
          hash: test.hash,
          status: "skipped",
          questionsDetected: 0,
          answersDetected: 0,
          questionsInserted: 0,
          questionsUpdated: 0,
          questionsSkipped: 0,
          answersInserted: 0,
          answersUpdated: 0,
          answersSkipped: 0,
          errorMessage: "Already imported in Supabase.",
        };
        appendLog(skippedLog);
        continue;
      }

      setProgress((current) => ({
        ...current,
        currentIndex: index + 1,
        currentTitle: test.title,
        statusMessage: isDryRun
          ? `Dry run ${index + 1}/${batch.length}: ${test.title}`
          : `Importing ${index + 1}/${batch.length}: ${test.title}`,
      }));

      const log = await importTestWithRetry(test, isDryRun);
      appendLog(log);

      if (log.status === "imported" && !isDryRun) {
        markTestImported(test.hash);
      }

      if (index < batch.length - 1 && delayMs > 0 && !cancelRef.current) {
        setProgress((current) => ({
          ...current,
          statusMessage: `Waiting ${delayMs}ms before next test...`,
        }));
        await sleep(delayMs);
      }
    }

    setProgress((current) => ({
      ...current,
      isRunning: false,
      finishedAt: new Date().toISOString(),
      statusMessage: isDryRun
        ? `Dry run finished (${batch.length} tests).`
        : `Bulk import finished (${batch.length} tests processed).`,
    }));

    if (!isDryRun) {
      await handleRefreshDatabaseCounts();
    }
  }

  function handleCancelImport() {
    cancelRef.current = true;
    setProgress((current) => ({
      ...current,
      statusMessage: "Cancelling after the current test...",
    }));
  }

  return (
    <PageContainer width="full" innerClassName="gap-4">
      <PageHeader
        eyebrow="Bulk import"
        title="Discover tests"
        description="Discover available tests, preview the index, and import them in small resumable batches with immediate Supabase persistence."
        meta={
          <Button href="/import" variant="link" className="px-0">
            Back to Import
          </Button>
        }
      />

      <Card>
        <Button
          onClick={handleDiscover}
          disabled={isDiscovering || progress.isRunning}
        >
          {isDiscovering ? "Discovering..." : "Discover tests"}
        </Button>
        <p className="mt-3 text-sm text-text-secondary">
          Uses a small number of server-side requests. Discovery does not import
          anything.
        </p>
        {error ? (
          <Card tone="danger" padding="sm" className="mt-4 shadow-none">
            {error}
          </Card>
        ) : null}
      </Card>

        {result ? (
          <>
            <Card>
              <h2 className="text-lg font-semibold text-text-primary">
                Diagnostics
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard
                  label="Discovered tests"
                  value={importDiagnostics?.discoveredCount ?? 0}
                  size="sm"
                />
                <StatCard
                  label="With asset URL"
                  value={importDiagnostics?.withAssetUrl ?? 0}
                  size="sm"
                />
                <StatCard
                  label="Already imported"
                  value={importDiagnostics?.importedCount ?? 0}
                  size="sm"
                />
                <StatCard
                  label="Remaining"
                  value={importDiagnostics?.remainingCount ?? 0}
                  size="sm"
                />
                <StatCard
                  label="Asset mappings"
                  value={result.diagnostics.assetMappingsFound}
                  size="sm"
                />
                <StatCard
                  label="Catalog entries"
                  value={result.diagnostics.catalogEntriesFound}
                  size="sm"
                />
              </dl>

              <div className="mt-4 space-y-2 text-sm text-text-primary">
                <p>
                  <span className="font-semibold">Bundles scanned:</span>{" "}
                  {result.bundlesScanned.join(", ")}
                </p>
                <p>
                  <span className="font-semibold">Index found:</span>{" "}
                  {result.indexFound ? "Yes" : "Candidates only"}
                </p>
                {progress.startedAt ? (
                  <p>
                    <span className="font-semibold">Last import started:</span>{" "}
                    {formatTimestamp(progress.startedAt)}
                  </p>
                ) : null}
                {progress.finishedAt ? (
                  <p>
                    <span className="font-semibold">Last import finished:</span>{" "}
                    {formatTimestamp(progress.finishedAt)}
                  </p>
                ) : null}
                {result.diagnostics.errors.map((diagnosticError) => (
                  <Card
                    key={diagnosticError}
                    tone="warning"
                    padding="sm"
                    className="shadow-none"
                  >
                    {diagnosticError}
                  </Card>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary">
                Bulk import controls
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Imports the next N not-yet-imported tests with asset URLs.
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Each test is saved to Supabase immediately after parsing.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <FieldLabel className="mb-1">Batch size (N)</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={limit}
                    onChange={(event) => setLimit(Number(event.target.value))}
                    disabled={progress.isRunning}
                    inputSize="sm"
                  />
                </label>
                <label className="text-sm">
                  <FieldLabel className="mb-1">Delay (ms)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={10000}
                    step={50}
                    value={delayMs}
                    onChange={(event) => setDelayMs(Number(event.target.value))}
                    disabled={progress.isRunning}
                    inputSize="sm"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="success"
                  onClick={() => runBulkImport(false)}
                  disabled={progress.isRunning || !result}
                >
                  {progress.isRunning
                    ? "Import running..."
                    : "Import next batch"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => runBulkImport(true)}
                  disabled={progress.isRunning || !result}
                >
                  Dry run next batch
                </Button>
                {progress.isRunning ? (
                  <Button variant="danger" onClick={handleCancelImport}>
                    Cancel import
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary">
                Import progress
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                <StatCard
                  label="Current"
                  value={
                    progress.selectedTotal
                      ? `${progress.currentIndex}/${progress.selectedTotal}`
                      : "—"
                  }
                  size="sm"
                />
                <StatCard label="Imported" value={progress.importedCount} size="sm" />
                <StatCard label="Skipped" value={progress.skippedCount} size="sm" />
                <StatCard label="Failed" value={progress.failedCount} size="sm" />
                <StatCard label="Dry run" value={progress.dryRunCount} size="sm" />
                <StatCard
                  label="Questions"
                  value={progress.questionsProcessed}
                  size="sm"
                />
                <StatCard
                  label="Answers"
                  value={progress.answersProcessed}
                  size="sm"
                />
                <StatCard
                  label="Status"
                  value={progress.isRunning ? "Running" : "Idle"}
                  size="sm"
                />
              </dl>
              {progress.currentTitle ? (
                <p className="mt-3 text-sm text-text-primary">
                  <span className="font-semibold">Current test:</span>{" "}
                  {progress.currentTitle}
                </p>
              ) : null}
              {progress.statusMessage ? (
                <p className="mt-2 text-sm text-text-secondary">
                  {progress.statusMessage}
                </p>
              ) : null}
            </Card>

            <Card>
              <SectionHeader
                title="Database counts"
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRefreshDatabaseCounts}
                    disabled={isLoadingStats}
                  >
                    {isLoadingStats ? "Loading..." : "Refresh database counts"}
                  </Button>
                }
              />
              {databaseStats ? (
                <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <StatCard
                    label="Sources"
                    value={databaseStats.sourcesCount}
                    size="sm"
                  />
                  <StatCard
                    label="Questions"
                    value={databaseStats.questionsCount}
                    size="sm"
                  />
                  <StatCard
                    label="Answers"
                    value={databaseStats.answersCount}
                    size="sm"
                  />
                </dl>
              ) : (
                <p className="mt-3 text-sm text-text-secondary">
                  Refresh to verify how many rows are currently stored in
                  Supabase.
                </p>
              )}
            </Card>

            {progress.logs.length ? (
              <Card>
                <h2 className="text-lg font-semibold text-text-primary">
                  Import log
                </h2>
                <div className="mt-4 space-y-3">
                  {progress.logs.map((log) => (
                    <ImportLogEntry key={`${log.hash}-${log.timestamp}`} log={log} />
                  ))}
                </div>
              </Card>
            ) : null}

            <Card>
              <SectionHeader
                title="Discovered tests"
                description={`Showing ${visibleTests.length} of ${result.tests.length} tests.`}
                action={
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="text-sm">
                      <FieldLabel className="mb-1">Type</FieldLabel>
                      <Select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                      >
                        <option value="all">All types</option>
                        {types.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="text-sm">
                      <FieldLabel className="mb-1">Status</FieldLabel>
                      <Select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                      >
                        <option value="all">All statuses</option>
                        <option value="not_imported">Not imported</option>
                        <option value="imported">Imported</option>
                      </Select>
                    </label>
                  </div>
                }
              />

              <TableWrap className="mt-4">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell header>Title</TableCell>
                      <TableCell header>Hash</TableCell>
                      <TableCell header>Type</TableCell>
                      <TableCell header>Date</TableCell>
                      <TableCell header>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleTests.map((test) => (
                      <TestRow key={test.hash} test={test} />
                    ))}
                  </TableBody>
                </Table>
              </TableWrap>
            </Card>
          </>
        ) : null}
    </PageContainer>
  );
}

function ImportLogEntry({ log }: { log: BulkImportTestLog }) {
  const tone =
    log.status === "failed"
      ? "danger"
      : log.status === "imported"
        ? "success"
        : log.status === "dry_run_ok"
          ? "muted"
          : "default";

  return (
    <Card as="article" tone={tone} padding="sm" className="text-sm shadow-none">
      <p className="font-semibold">
        {log.title} · {log.status}
      </p>
      <p className="mt-1 font-mono text-xs">{log.hash}</p>
      <p className="mt-1 text-xs">{formatTimestamp(log.timestamp)}</p>
      <p className="mt-2">
        Questions: {log.questionsDetected} detected, {log.questionsInserted}{" "}
        inserted, {log.questionsUpdated} updated, {log.questionsSkipped}{" "}
        skipped
      </p>
      <p>
        Answers: {log.answersDetected} detected, {log.answersInserted}{" "}
        inserted, {log.answersUpdated} updated, {log.answersSkipped} skipped
      </p>
      {log.errorMessage ? (
        <p className="mt-2 font-medium">{log.errorMessage}</p>
      ) : null}
    </Card>
  );
}

function TestRow({ test }: { test: DiscoveredTest }) {
  return (
    <TableRow className="align-top">
      <TableCell>
        <p className="font-medium text-text-primary">{test.title}</p>
        {test.description ? (
          <p className="mt-1 text-xs text-text-muted">{test.description}</p>
        ) : null}
        <p className="mt-1 break-all text-xs text-text-muted">
          <a
            href={test.testUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-2"
          >
            {test.testUrl}
          </a>
        </p>
        {test.assetUrl ? (
          <p className="mt-1 break-all text-xs text-text-muted">
            {test.assetUrl}
          </p>
        ) : null}
      </TableCell>
      <TableCell className="font-mono text-xs">{test.hash}</TableCell>
      <TableCell>{test.type}</TableCell>
      <TableCell>{test.date ? formatDate(test.date) : "—"}</TableCell>
      <TableCell>
        <Badge
          variant={test.importStatus === "imported" ? "success" : "neutral"}
        >
          {test.importStatus === "imported" ? "Imported" : "Not imported"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-ES");
}

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-ES");
}
