"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import { PdfStudyReader } from "@/components/study/PdfStudyReader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import type { TemaOficial } from "@/lib/officialTopics";
import {
  getStudyProgress,
  saveStudyProgress,
  studyPdfPath,
  topicKey,
  updateStudyTopicProgress,
} from "@/lib/studyProgress";
import { useStudyProgress } from "@/lib/useStudyProgress";

type Props = {
  topic: TemaOficial;
  previousTopic: TemaOficial | null;
  nextTopic: TemaOficial | null;
};

export function StudyTopicPageContent({ topic, previousTopic, nextTopic }: Props) {
  const { t } = useI18n();
  const { profile, isHydrated } = useProfile();
  const key = topicKey(topic);
  const progress = useStudyProgress(profile?.id);
  const current = progress[key];
  const page = current?.page ?? 1;
  const status = current?.status ?? "not-started";
  const longPdfUrl = studyPdfPath(topic, "long");

  useEffect(() => {
    if (!profile?.id) return;
    const stored = getStudyProgress(profile.id);
    if (!stored[key]) {
      saveStudyProgress(profile.id, updateStudyTopicProgress(stored, key, { status: "in-progress", page: 1 }));
    }
  }, [key, profile?.id]);

  function persist(update: { page?: number; status?: "in-progress" | "completed" }) {
    if (!profile?.id) return;
    saveStudyProgress(profile.id, updateStudyTopicProgress(getStudyProgress(profile.id), key, update));
  }

  return (
    <PageContainer width="full">
      <PageHeader
        backLink={{ href: "/study", label: t("study.back") }}
        eyebrow={`${t("study.topic")} ${key}`}
        title={topic.titulo}
        description={t("study.topicDescription")}
      />

      {!isHydrated ? null : !profile ? (
        <Card tone="warning"><p className="text-sm text-text-secondary">{t("study.chooseProfile")}</p></Card>
      ) : (
        <Card padding="sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("study.topicStatus")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-text-primary">{t(`study.status.${status}`)}</span>
                <span className="text-sm text-text-muted">{t("study.savedAutomatically", { page })}</span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button href={studyPdfPath(topic, "short")} variant="secondary">{t("study.openShort")}</Button>
              <Button href={`/test?mode=official-topic&topic=${key}&count=10`} variant="secondary">{t("study.topicTest")}</Button>
              <Button variant={status === "completed" ? "subtle" : "primary"} onClick={() => persist({ status: status === "completed" ? "in-progress" : "completed" })}>
                {status === "completed" ? t("study.markInProgress") : t("study.markCompleted")}
              </Button>
            </div>
          </div>
          <p className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-muted">{t("study.testMetricsNote")}</p>
        </Card>
      )}

      <PdfStudyReader pdfUrl={longPdfUrl} title={`${key} ${topic.titulo}`} initialPage={page} onPageChange={(nextPage) => persist({ page: nextPage })} />

      <nav className="flex items-center justify-between gap-4" aria-label={t("study.topicNavigation")}>
        {previousTopic ? <Link className="text-sm text-accent underline underline-offset-4" href={`/study/${topicKey(previousTopic)}`}>← {t("study.previous")}</Link> : <span />}
        {nextTopic ? <Link className="text-sm text-accent underline underline-offset-4" href={`/study/${topicKey(nextTopic)}`}>{t("study.next")} →</Link> : <span />}
      </nav>
    </PageContainer>
  );
}
