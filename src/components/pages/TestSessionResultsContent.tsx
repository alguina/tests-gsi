"use client";

import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { TestResultsContent } from "@/components/pages/TestResultsContent";
import { useI18n } from "@/lib/i18n/useI18n";
import type { TestResult } from "@/lib/testSession";

type TestSessionResultsContentProps = {
  result: TestResult;
  examResults?: ReactNode;
};

export function TestSessionResultsContent({
  result,
  examResults,
}: TestSessionResultsContentProps) {
  const { t } = useI18n();

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("test.eyebrow")}
        title={result.title ?? t("test.results")}
        description={t("test.modeLabel", { mode: result.mode })}
        meta={
          <Button href="/history" variant="link" className="px-0">
            {t("test.backToHistory")}
          </Button>
        }
      />
      {examResults ?? (
        <TestResultsContent result={result} showSessionMeta={false} />
      )}
    </PageContainer>
  );
}
