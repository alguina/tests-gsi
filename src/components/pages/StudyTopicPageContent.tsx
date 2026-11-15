"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
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
  const pageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile?.id) return;
    const stored = getStudyProgress(profile.id);
    if (!stored[key]) {
      saveStudyProgress(profile.id, updateStudyTopicProgress(stored, key, { status: "in-progress", page: 1 }));
    }
  }, [key, profile?.id]);

  function persist(update: { page?: number; status?: "in-progress" | "completed" }) {
    if (!profile?.id) return;
    const next = updateStudyTopicProgress(getStudyProgress(profile.id), key, update);
    saveStudyProgress(profile.id, next);
  }

  const pdfUrl = useMemo(() => `${studyPdfPath(topic, "long")}#page=${page}&view=FitH`, [page, topic]);

  return (
    <PageContainer width="full">
      <Link href="/study" className="mb-4 inline-flex text-sm text-accent underline underline-offset-4">{t("study.back")}</Link>
      <PageHeader eyebrow={`${t("study.topic")} ${key}`} title={topic.titulo} description={t("study.topicDescription")} />

      {!isHydrated ? null : !profile ? (
        <Card tone="warning" className="mb-4"><p className="text-sm text-text-secondary">{t("study.chooseProfile")}</p></Card>
      ) : (
        <Card className="mb-4" padding="sm">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-text-secondary">
              {t("study.page")}
              <input
                className="ml-2 w-20 rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
                type="number"
                min={1}
                key={page}
                defaultValue={page}
                ref={pageInputRef}
                onBlur={(event) => persist({ page: Math.max(1, Number(event.target.value) || 1) })}
              />
            </label>
            <Button variant="secondary" onClick={() => persist({ page: Math.max(1, Number(pageInputRef.current?.value) || page), status: "in-progress" })}>{t("study.savePage")}</Button>
            <Button variant={status === "completed" ? "secondary" : "success"} onClick={() => persist({ page, status: status === "completed" ? "in-progress" : "completed" })}>
              {status === "completed" ? t("study.markInProgress") : t("study.markCompleted")}
            </Button>
            <Button href={studyPdfPath(topic, "short")} variant="subtle">{t("study.openShort")}</Button>
            <Button href={`/test?mode=official-topic&topic=${key}&count=10`} variant="primary">{t("study.topicTest")}</Button>
          </div>
          <p className="mt-3 text-xs text-text-muted">{t("study.testMetricsNote")}</p>
        </Card>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <iframe key={pdfUrl} title={`${key} ${topic.titulo}`} src={pdfUrl} className="h-[75vh] min-h-[640px] w-full" />
      </div>

      <nav className="mt-5 flex items-center justify-between gap-4" aria-label={t("study.topicNavigation")}>
        {previousTopic ? <Link className="text-sm text-accent underline underline-offset-4" href={`/study/${topicKey(previousTopic)}`}>← {t("study.previous")}</Link> : <span />}
        {nextTopic ? <Link className="text-sm text-accent underline underline-offset-4" href={`/study/${topicKey(nextTopic)}`}>{t("study.next")} →</Link> : <span />}
      </nav>
    </PageContainer>
  );
}

