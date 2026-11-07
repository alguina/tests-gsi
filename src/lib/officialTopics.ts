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
 *
 * Las entradas con confianza "sin_asignar" conservan el tema tentativo que
 * produjo el clasificador, pero NUNCA se agregan a un tema: van a un grupo
 * global de pendientes de revision. Atribuirlas inflaria temas no validados.
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

export type ConteoConfianza = Record<"alta" | "media" | "baja", number>;

export type CoberturaTema = {
  tema: TemaOficial;
  total: number;
  porConfianza: ConteoConfianza;
};

export type CoberturaBanco = {
  temas: CoberturaTema[];
  /** Preguntas distintas sin tema validado (confianza sin_asignar). */
  sinAsignar: number;
};

/**
 * Composicion del banco por tema oficial sobre preguntas DISTINTAS.
 * Solo cuentan asignaciones con confianza alta/media/baja; las sin_asignar
 * van aparte para no inflar temas no validados.
 */
export function getOfficialCoverage(): CoberturaBanco {
  const porTema = new Map<string, CoberturaTema>();
  let sinAsignar = 0;
  for (const entry of Object.values(topicMapDistinct)) {
    const asignacion = toAsignacion(entry);
    if (!asignacion || asignacion.confianza === "sin_asignar") {
      sinAsignar += 1;
      continue;
    }
    const clave = `${asignacion.bloque}.${asignacion.tema}`;
    let c = porTema.get(clave);
    if (!c) {
      c = {
        tema: { bloque: asignacion.bloque, tema: asignacion.tema, titulo: asignacion.titulo },
        total: 0,
        porConfianza: { alta: 0, media: 0, baja: 0 },
      };
      porTema.set(clave, c);
    }
    c.total += 1;
    c.porConfianza[asignacion.confianza as keyof ConteoConfianza] += 1;
  }
  const temas = TEMARIO_OFICIAL.map(
    (tema) =>
      porTema.get(`${tema.bloque}.${tema.tema}`) ?? {
        tema,
        total: 0,
        porConfianza: { alta: 0, media: 0, baja: 0 },
      },
  );
  return { temas, sinAsignar };
}

/** Distinct high-confidence representatives only; provisional until human review. */
export function getOfficialTopicQuestionIds(key: string): string[] {
  if (!temaIndex.has(key)) return [];
  return Object.entries(topicMapDistinct)
    .filter(([, entry]) => {
      const a = toAsignacion(entry);
      return a && (a.confianza === "alta" || a.confianza === "revisada") && `${a.bloque}.${a.tema}` === key;
    })
    .map(([id]) => id);
}

export function findOfficialTopic(key: string): TemaOficial | undefined {
  return temaIndex.get(key);
}
