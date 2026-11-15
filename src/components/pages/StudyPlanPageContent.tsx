"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import { FIRST_PASS_WEEKS, PLAN_MILESTONES, SECOND_PASS_WEEKS } from "@/lib/studyPlan";

export function StudyPlanPageContent() {
  const { t } = useI18n();

  return (
    <PageContainer>
      <PageHeader backLink={{ href: "/study", label: t("study.back") }} eyebrow={t("studyPlan.eyebrow")} title={t("studyPlan.title")} description={t("studyPlan.description")} />

      <Card tone="muted">
        <p className="text-sm leading-6 text-text-secondary">{t("studyPlan.assumptions")}</p>
        <p className="mt-2 text-sm font-medium text-text-primary">{t("studyPlan.target")}</p>
      </Card>

      <section>
        <h2 className="text-lg font-semibold text-text-primary">{t("studyPlan.firstPass")}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{t("studyPlan.firstPassHelp")}</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="hidden grid-cols-[1fr_1fr_2fr] gap-4 border-b border-border bg-surface-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted sm:grid">
            <span>{t("studyPlan.dates")}</span><span>{t("studyPlan.topics")}</span><span>{t("studyPlan.weeklyWork")}</span>
          </div>
          {FIRST_PASS_WEEKS.map((week) => (
            <div key={week.dates} className="grid gap-2 border-b border-border-subtle px-4 py-4 last:border-0 sm:grid-cols-[1fr_1fr_2fr] sm:gap-4">
              <p className="text-sm font-medium text-text-primary">{week.dates}</p>
              <p className="text-sm font-semibold text-accent">{week.topics}</p>
              <p className="text-sm text-text-secondary">{t(week.practice === "holiday" ? "studyPlan.practiceHoliday" : "studyPlan.practiceNormal")}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-primary">{t("studyPlan.milestones")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {PLAN_MILESTONES.map((milestone) => (
            <Card key={milestone.date} variant="stat" as="div">
              <p className="text-xs uppercase tracking-wide text-text-muted">{milestone.date}</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{milestone.completed} / 57</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-primary">{t("studyPlan.secondPass")}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{t("studyPlan.secondPassHelp")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SECOND_PASS_WEEKS.map((week) => (
            <Card key={week.dates} padding="sm">
              <p className="text-xs font-medium text-text-muted">{week.dates}</p>
              <p className="mt-1 font-semibold text-text-primary">{week.topics}</p>
              <p className="mt-2 text-sm text-text-secondary">{t("studyPlan.secondPassPractice")}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-text-primary">{t("studyPlan.examPhase")}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{t("studyPlan.examPhaseHelp")}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-text-primary">{t("studyPlan.cadence")}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{t("studyPlan.cadenceHelp")}</p>
          <p className="mt-3 text-sm font-medium text-text-primary">{t("studyPlan.delayRule")}</p>
        </Card>
      </section>
    </PageContainer>
  );
}
