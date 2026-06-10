"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
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
import type { getTopicSummaries } from "@/lib/studyMetrics";

type ReviewTopicsPageContentProps = {
  topics: Awaited<ReturnType<typeof getTopicSummaries>>;
};

export function ReviewTopicsPageContent({ topics }: ReviewTopicsPageContentProps) {
  const { t } = useI18n();

  return (
    <PageContainer width="full">
      <PageHeader
        eyebrow={t("reviewTopics.eyebrow")}
        title={t("reviewTopics.title")}
        description={t("reviewTopics.description")}
      />

      {topics.length ? (
        <Card padding="sm">
          <TableWrap>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>{t("reviewTopics.topic")}</TableCell>
                  <TableCell header>{t("reviewTopics.totalQuestions")}</TableCell>
                  <TableCell header>{t("reviewTopics.answered")}</TableCell>
                  <TableCell header>{t("reviewTopics.accuracy")}</TableCell>
                  <TableCell header>{t("reviewTopics.priority")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.topic}>
                    <TableCell className="font-medium">{topic.topic}</TableCell>
                    <TableCell>{topic.totalQuestions}</TableCell>
                    <TableCell>{topic.answered}</TableCell>
                    <TableCell>
                      {topic.accuracy === null
                        ? t("reviewTopics.noAttempts")
                        : `${Math.round(topic.accuracy * 100)}%`}
                    </TableCell>
                    <TableCell className="capitalize">{topic.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </Card>
      ) : (
        <EmptyState
          title={t("reviewTopics.noTopicsFound")}
          description={t("reviewTopics.noTopicsDescription")}
          action={
            <Button href="/import" variant="secondary">
              {t("reviewTopics.goToImport")}
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}
