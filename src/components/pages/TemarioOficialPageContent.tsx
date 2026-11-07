"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import type { TemarioOficialData } from "@/lib/officialTopics";

const BAND_ORDER = ["alta", "media", "baja", "sin_asignar"] as const;

const BAND_KEY: Record<string, string> = {
  alta: "officialSyllabus.confidence.alta",
  media: "officialSyllabus.confidence.media",
  baja: "officialSyllabus.confidence.baja",
  sin_asignar: "officialSyllabus.confidence.sinAsignar",
};

type Props = {
  data: TemarioOficialData;
};

export function TemarioOficialPageContent({ data }: Props) {
  const { t } = useI18n();
  const bloques = ["I", "II", "III", "IV"];
  const { banco, practica, temas } = data;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("officialSyllabus.eyebrow")}
        title={t("officialSyllabus.title")}
        description={t("officialSyllabus.description")}
      />

      <Card tone="warning" as="section" className="mb-4">
        <p className="text-sm leading-6 text-text-secondary">
          {t("officialSyllabus.banner")}
        </p>
      </Card>

      <section className="mb-6">
        <h2 className="mb-2 text-base font-medium tracking-tight text-text-primary">
          {t("officialSyllabus.practice.title")}
        </h2>
        {practica.answered + practica.blank === 0 ? (
          <Card as="div" padding="sm">
            <p className="text-sm text-text-secondary">
              {t("officialSyllabus.practice.none")}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card variant="stat" as="div">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {t("officialSyllabus.practice.summary")}
              </p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {practica.answered}
              </p>
            </Card>
            <Card variant="stat" as="div">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {t("officialSyllabus.practice.globalAccuracy")}
              </p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {practica.accuracy === null
                  ? t("common.dash")
                  : `${practica.accuracy}%`}
              </p>
            </Card>
            <Card variant="stat" as="div">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {t("officialSyllabus.practice.blank")}
              </p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {practica.blank}
              </p>
            </Card>
            <Card variant="stat" as="div">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {t("officialSyllabus.practice.unmappedTitle")}
              </p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {practica.sinAsignacion}
              </p>
            </Card>
          </div>
        )}
        <p className="mt-2 text-xs text-text-muted">
          {t("officialSyllabus.practice.verificationNote")}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-base font-medium tracking-tight text-text-primary">
          {t("officialSyllabus.bank.title")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BAND_ORDER.map((banda) => (
            <Card key={banda} variant="stat" as="div">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {t(BAND_KEY[banda])}
              </p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {banco.porConfianza[banda]}
              </p>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          {t("officialSyllabus.bank.distinct", {
            count: banco.preguntasDistintas,
          })}
          {" · "}
          {t("officialSyllabus.bank.rows", { count: banco.filasCubiertas })}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {t("officialSyllabus.bank.idCoverage")}
        </p>
      </section>

      {bloques.map((bloque) => (
        <section key={bloque} className="mb-6">
          <h2 className="mb-2 text-base font-medium tracking-tight text-text-primary">
            {t("officialSyllabus.block", { bloque })}
          </h2>
          <ul className="grid gap-2">
            {temas
              .filter((c) => c.tema.bloque === bloque)
              .map((c) => (
                <Card key={`${c.tema.bloque}.${c.tema.tema}`} as="div" padding="sm">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">
                      {c.tema.bloque}.{c.tema.tema}
                    </span>{" "}
                    {c.tema.titulo}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {c.practica.answered + c.practica.blank > 0
                      ? t("officialSyllabus.tema.practice", {
                          answered: c.practica.answered,
                          accuracy:
                            c.practica.accuracy === null
                              ? t("common.dash")
                              : c.practica.accuracy,
                        })
                      : t("officialSyllabus.tema.noPractice")}
                    {" · "}
                    {t("officialSyllabus.questions", { count: c.total })}
                    {" · "}
                    {BAND_ORDER.map(
                      (banda) =>
                        `${t(BAND_KEY[banda])}: ${c.porConfianza[banda]}`,
                    ).join(" · ")}
                  </p>
                </Card>
              ))}
          </ul>
        </section>
      ))}
    </PageContainer>
  );
}
