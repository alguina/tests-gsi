"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import type { CoberturaBanco } from "@/lib/officialTopics";

const BAND_ORDER = ["alta", "media", "baja", "sin_asignar"] as const;
const TEMA_BAND_ORDER = ["alta", "media", "baja"] as const;

const BAND_KEY: Record<string, string> = {
  alta: "officialSyllabus.confidence.alta",
  media: "officialSyllabus.confidence.media",
  baja: "officialSyllabus.confidence.baja",
  sin_asignar: "officialSyllabus.confidence.sinAsignar",
};

type Props = {
  cobertura: CoberturaBanco;
};

export function TemarioOficialPageContent({ cobertura }: Props) {
  const { t } = useI18n();
  const bloques = ["I", "II", "III", "IV"];
  const totales = { alta: 0, media: 0, baja: 0, sin_asignar: cobertura.sinAsignar };
  let distintas = cobertura.sinAsignar;
  for (const c of cobertura.temas) {
    totales.alta += c.porConfianza.alta;
    totales.media += c.porConfianza.media;
    totales.baja += c.porConfianza.baja;
    distintas += c.total;
  }

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
          {t("officialSyllabus.bank.title")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BAND_ORDER.map((banda) => (
            <Card key={banda} variant="stat" as="div">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                {t(BAND_KEY[banda])}
              </p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {totales[banda]}
              </p>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          {t("officialSyllabus.bank.distinct", { count: distintas })}
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
            {cobertura.temas
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
                    {t("officialSyllabus.questions", { count: c.total })}
                    {" · "}
                    {TEMA_BAND_ORDER.map(
                      (banda) =>
                        `${t(BAND_KEY[banda])}: ${c.porConfianza[banda]}`,
                    ).join(" · ")}
                  </p>
                  {c.porConfianza.alta > 0 && (
                    <Link className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-medium text-text-primary hover:bg-surface-muted focus-visible:outline-2" href={`/test?mode=official-topic&topic=${c.tema.bloque}.${c.tema.tema}&count=10`}>
                      {t("officialSyllabus.startTest", { count: Math.min(10, c.porConfianza.alta) })}
                    </Link>
                  )}
                  {c.porConfianza.alta === 0 && <p className="mt-2 text-xs text-text-muted">{t("officialSyllabus.noHighQuestions")}</p>}
                </Card>
              ))}
          </ul>
        </section>
      ))}
    </PageContainer>
  );
}
