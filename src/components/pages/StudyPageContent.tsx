"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import type { TemaOficial } from "@/lib/officialTopics";
import {
  topicKey,
  type StudyTopicStatus,
} from "@/lib/studyProgress";
import { useStudyProgress } from "@/lib/useStudyProgress";

type Props = { topics: readonly TemaOficial[] };

export function StudyPageContent({ topics }: Props) {
  const { t } = useI18n();
  const { profile, isHydrated } = useProfile();
  const progress = useStudyProgress(profile?.id);

  const summary = useMemo(() => {
    const entries = Object.values(progress);
    const completed = entries.filter((item) => item.status === "completed").length;
    const inProgress = entries.filter((item) => item.status === "in-progress").length;
    const lastKey = Object.entries(progress).sort(([, left], [, right]) =>
      right.updatedAt.localeCompare(left.updatedAt),
    )[0]?.[0];
    return { completed, inProgress, lastKey };
  }, [progress]);

  const percentage = Math.round((summary.completed / topics.length) * 100);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("study.eyebrow")}
        title={t("study.title")}
        description={t("study.description")}
        actions={<Button href="/study/plan" variant="secondary">{t("study.openPlan")}</Button>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card variant="stat" as="div">
          <p className="text-xs uppercase tracking-wide text-text-muted">{t("study.completed")}</p>
          <p className="mt-1 text-xl font-semibold text-text-primary">{summary.completed} / {topics.length}</p>
        </Card>
        <Card variant="stat" as="div">
          <p className="text-xs uppercase tracking-wide text-text-muted">{t("study.inProgress")}</p>
          <p className="mt-1 text-xl font-semibold text-text-primary">{summary.inProgress}</p>
        </Card>
        <Card variant="stat" as="div">
          <p className="text-xs uppercase tracking-wide text-text-muted">{t("study.progress")}</p>
          <p className="mt-1 text-xl font-semibold text-text-primary">{percentage}%</p>
        </Card>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-muted" aria-label={t("study.progress")}>
        <div className="h-full bg-accent transition-all" style={{ width: `${percentage}%` }} />
      </div>

      {!isHydrated ? null : !profile ? (
        <Card tone="warning" className="mb-6"><p className="text-sm text-text-secondary">{t("study.chooseProfile")}</p></Card>
      ) : summary.lastKey ? (
        <Card className="mb-6" tone="muted">
          <p className="text-sm text-text-secondary">{t("study.resumeHelp")}</p>
          <Link className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-cta px-4 text-sm font-medium" href={`/study/${summary.lastKey}`}>
            {t("study.resume")}
          </Link>
        </Card>
      ) : null}

      {["I", "II", "III", "IV"].map((block) => (
        <section key={block} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">{t("study.block", { block })}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {topics.filter((topic) => topic.bloque === block).map((topic) => {
              const key = topicKey(topic);
              const item = progress[key];
              const status: StudyTopicStatus = item ? item.status : "not-started";
              return (
                <Card key={key} as="article" padding="sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-accent">{key}</p>
                      <h3 className="mt-1 text-sm font-medium leading-5 text-text-primary">{topic.titulo}</h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface-muted px-2 py-1 text-xs text-text-secondary">
                      {t(`study.status.${status}`)}
                    </span>
                  </div>
                  {item && <p className="mt-2 text-xs text-text-muted">{t("study.savedPage", { page: item.page })}</p>}
                  <Link className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-accent underline underline-offset-4" href={`/study/${key}`}>
                    {status === "not-started" ? t("study.start") : t("study.continue")}
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </PageContainer>
  );
}

