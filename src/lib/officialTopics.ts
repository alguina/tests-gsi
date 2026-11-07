import topicMapRaw from "@/data/topic-map-v2.json";
import topicMapDistinctRaw from "@/data/topic-map-v2-distinct.json";
import temarioRaw from "@/data/gsi-temario-oficial.json";

/**
 * Mapeo PROPUESTA (v2, 2026-11-07) de preguntas del banco al temario oficial
 * GSI A2 ingreso libre (BOE-A-2025-26262, Anexo IX: 4 bloques, 57 temas).
 *
 * Generado automaticamente (embeddings + keywords) y PENDIENTE de revision.
 * Ver docs/mapeo-temas-oficiales-v2.md. No modifica block/topic de la app:
 * es una capa aditiva de solo lectura.
 *
 * Dos vistas del mismo mapeo:
 * - topic-map-v2.json: TODAS las filas de questions (77.961 ids), porque la
 *   app importa el mismo examen varios anos y un intent puede apuntar a
 *   cualquiera de las filas duplicadas. Sin esto, historial y tests
 *   quedarian sin mapeo al elegir el id representante.
 * - topic-map-v2-distinct.json: las 16.348 preguntas distintas (texto +
 *   opciones), usada para composicion del banco sin inflar por duplicados.
 */

export type ConfianzaMapeo = "alta" | "media" | "baja" | "sin_asignar" | "revisada";

export type TemaOficial = {
  bloque: string;
  tema: number;
  titulo: string;
};

export type AsignacionOficial = {
  bloque: string;
  tema: number;
  titulo: string;
  confianza: ConfianzaMapeo;
};

const CONFIANZAS: readonly ConfianzaMapeo[] = [
  "alta",
  "media",
  "baja",
  "sin_asignar",
  "revisada",
];

export const TEMARIO_OFICIAL: readonly TemaOficial[] = (
  temarioRaw as { bloque: string; tema: number; titulo: string }[]
).map((t) => ({ bloque: t.bloque, tema: t.tema, titulo: t.titulo }));

const temaIndex = new Map<string, TemaOficial>(
  TEMARIO_OFICIAL.map((t) => [`${t.bloque}.${t.tema}`, t]),
);

type EntradaMapa = [string | null, number | null, string];

const topicMap = topicMapRaw as unknown as Record<string, EntradaMapa>;
const topicMapDistinct = topicMapDistinctRaw as unknown as Record<string, EntradaMapa>;

function toAsignacion(entry: EntradaMapa): AsignacionOficial | null {
  const [bloque, temaN, confianzaRaw] = entry;
  if (bloque === null || temaN === null) return null;
  const tema = temaIndex.get(`${bloque}.${temaN}`);
  if (!tema) return null;
  const confianza = (CONFIANZAS as readonly string[]).includes(confianzaRaw)
    ? (confianzaRaw as ConfianzaMapeo)
    : "sin_asignar";
  return { ...tema, confianza };
}

/** Devuelve la asignacion oficial PROPUESTA para cualquier fila de questions, o null. */
export function getOfficialTopic(questionId: string): AsignacionOficial | null {
  const entry = topicMap[questionId];
  if (!entry) return null;
  return toAsignacion(entry);
}

/** Una asignacion solo debe mostrarse como fiable tras revision humana. */
export function isConfianzaFiable(confianza: ConfianzaMapeo): boolean {
  return confianza === "revisada";
}

export type ConteoConfianza = Record<"alta" | "media" | "baja" | "sin_asignar", number>;

export type CoberturaTema = {
  tema: TemaOficial;
  total: number;
  porConfianza: ConteoConfianza;
};

/** Composicion del banco por tema oficial sobre preguntas DISTINTAS (sin duplicados anuales). */
export function getOfficialCoverage(): CoberturaTema[] {
  const porTema = new Map<string, CoberturaTema>();
  for (const entry of Object.values(topicMapDistinct)) {
    const asignacion = toAsignacion(entry);
    const clave = asignacion ? `${asignacion.bloque}.${asignacion.tema}` : "sin";
    let c = porTema.get(clave);
    if (!c) {
      c = {
        tema: asignacion
          ? { bloque: asignacion.bloque, tema: asignacion.tema, titulo: asignacion.titulo }
          : { bloque: "", tema: 0, titulo: "" },
        total: 0,
        porConfianza: { alta: 0, media: 0, baja: 0, sin_asignar: 0 },
      };
      porTema.set(clave, c);
    }
    c.total += 1;
    const banda = asignacion ? asignacion.confianza : "sin_asignar";
    if (banda in c.porConfianza) {
      c.porConfianza[banda as keyof ConteoConfianza] += 1;
    } else {
      c.porConfianza.sin_asignar += 1;
    }
  }
  return TEMARIO_OFICIAL.map(
    (tema) =>
      porTema.get(`${tema.bloque}.${tema.tema}`) ?? {
        tema,
        total: 0,
        porConfianza: { alta: 0, media: 0, baja: 0, sin_asignar: 0 },
      },
  );
}

export type AttemptRow = {
  question_id: string;
  is_correct: boolean | null;
  is_blank: boolean | null;
};

export type PracticaTema = {
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  accuracy: number | null;
};

export type PracticaResumen = PracticaTema & {
  /** Respuestas cuya fila no tiene asignacion (sin_asignar): no cuentan en ningun tema. */
  sinAsignacion: number;
};

export type TemarioOficialTema = CoberturaTema & { practica: PracticaTema };

export type TemarioOficialData = {
  temas: TemarioOficialTema[];
  banco: {
    preguntasDistintas: number;
    filasCubiertas: number;
    porConfianza: ConteoConfianza;
  };
  practica: PracticaResumen;
};

function nuevaPractica(): PracticaTema {
  return { answered: 0, correct: 0, wrong: 0, blank: 0, accuracy: null };
}

function cerrarPractica(p: PracticaTema): PracticaTema {
  return { ...p, accuracy: p.answered > 0 ? Math.round((p.correct / p.answered) * 100) : null };
}

/**
 * Combina la cobertura del banco con la practica real del usuario
 * (una entrada por respuesta registrada, igual que el panel).
 * Funcion pura: la carga de attempts vive en officialTopicsServer.
 */
export function computeTemarioOficialData(attempts: AttemptRow[]): TemarioOficialData {
  const cobertura = getOfficialCoverage();
  const practicaPorTema = new Map<string, PracticaTema>();
  const resumen: PracticaResumen = { ...nuevaPractica(), sinAsignacion: 0 };

  for (const attempt of attempts) {
    const asignacion = getOfficialTopic(attempt.question_id);
    const isBlank = attempt.is_blank === true;
    if (!asignacion) {
      resumen.sinAsignacion += 1;
      continue;
    }
    const clave = `${asignacion.bloque}.${asignacion.tema}`;
    const p = practicaPorTema.get(clave) ?? nuevaPractica();
    practicaPorTema.set(clave, p);
    for (const target of [p, resumen]) {
      if (isBlank) {
        target.blank += 1;
      } else {
        target.answered += 1;
        if (attempt.is_correct === true) target.correct += 1;
        else target.wrong += 1;
      }
    }
  }

  const temas: TemarioOficialTema[] = cobertura.map((c) => ({
    ...c,
    practica: cerrarPractica(
      practicaPorTema.get(`${c.tema.bloque}.${c.tema.tema}`) ?? nuevaPractica(),
    ),
  }));

  const porConfianza: ConteoConfianza = { alta: 0, media: 0, baja: 0, sin_asignar: 0 };
  for (const c of cobertura) {
    porConfianza.alta += c.porConfianza.alta;
    porConfianza.media += c.porConfianza.media;
    porConfianza.baja += c.porConfianza.baja;
    porConfianza.sin_asignar += c.porConfianza.sin_asignar;
  }

  return {
    temas,
    banco: {
      preguntasDistintas: Object.keys(topicMapDistinct).length,
      filasCubiertas: Object.keys(topicMap).length,
      porConfianza,
    },
    practica: { ...cerrarPractica(resumen), sinAsignacion: resumen.sinAsignacion },
  };
}
