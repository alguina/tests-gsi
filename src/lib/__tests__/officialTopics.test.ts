import { describe, expect, it } from "vitest";

import topicMapRaw from "../../data/topic-map-v2.json";
import topicMapDistinctRaw from "../../data/topic-map-v2-distinct.json";
import temarioRaw from "../../data/gsi-temario-oficial.json";
import {
  TEMARIO_OFICIAL,
  computeTemarioOficialData,
  getOfficialCoverage,
  getOfficialTopic,
  isConfianzaFiable,
} from "../officialTopics";

type EntradaMapa = [string | null, number | null, string];

const topicMap = topicMapRaw as Record<string, EntradaMapa>;
const topicMapDistinct = topicMapDistinctRaw as Record<string, EntradaMapa>;
const temario = temarioRaw as { bloque: string; tema: number; titulo: string }[];

const CLAVES_TEMA = new Set(TEMARIO_OFICIAL.map((t) => `${t.bloque}.${t.tema}`));

describe("officialTopics (mapeo propuesta v2)", () => {
  it("el temario oficial tiene 4 bloques y 57 temas (BOE-A-2025-26262 Anexo IX)", () => {
    expect(TEMARIO_OFICIAL).toHaveLength(57);
    const bloques = new Set(TEMARIO_OFICIAL.map((t) => t.bloque));
    expect(bloques).toEqual(new Set(["I", "II", "III", "IV"]));
    expect(temario).toHaveLength(57);
  });

  it("el mapa completo cubre TODAS las filas de questions (77.961) y cada entrada con tema es valida", () => {
    expect(Object.keys(topicMap)).toHaveLength(77961);
    for (const [bloque, tema, confianza] of Object.values(topicMap)) {
      if (bloque === null) {
        expect(confianza).toBe("sin_asignar");
        continue;
      }
      expect(CLAVES_TEMA.has(`${bloque}.${tema}`)).toBe(true);
    }
  });

  it("el mapa distinto cubre 16.348 preguntas y ninguna queda sin tema valido o sin_asignar explicito", () => {
    expect(Object.keys(topicMapDistinct)).toHaveLength(16348);
    for (const [bloque, tema, confianza] of Object.values(topicMapDistinct)) {
      expect(CLAVES_TEMA.has(`${bloque}.${tema}`)).toBe(true);
      expect(["alta", "media", "baja", "sin_asignar"]).toContain(confianza);
    }
  });

  it("la cobertura suma exactamente las preguntas distintas y no inventa temas", () => {
    const cobertura = getOfficialCoverage();
    expect(cobertura).toHaveLength(57);
    const total = cobertura.reduce((acc, c) => acc + c.total, 0);
    expect(total).toBe(Object.keys(topicMapDistinct).length);
    for (const c of cobertura) {
      const suma = Object.values(c.porConfianza).reduce((a, b) => a + b, 0);
      expect(suma).toBe(c.total);
    }
  });

  it("getOfficialTopic resuelve cualquier id de fila y null para ids ajenos o sin_asignar", () => {
    const [id, [bloque, tema]] = Object.entries(topicMap).find(
      ([, e]) => e[0] !== null,
    )!;
    const asignacion = getOfficialTopic(id);
    expect(asignacion).not.toBeNull();
    expect(asignacion?.bloque).toBe(bloque);
    expect(asignacion?.tema).toBe(tema);
    const [idSin] = Object.entries(topicMap).find(([, e]) => e[0] === null)!;
    expect(getOfficialTopic(idSin)).toBeNull();
    expect(getOfficialTopic("no-existe-este-id")).toBeNull();
    expect(getOfficialTopic("")).toBeNull();
  });

  it("isConfianzaFiable solo acepta revisada", () => {
    expect(isConfianzaFiable("revisada")).toBe(true);
    expect(isConfianzaFiable("alta")).toBe(false);
    expect(isConfianzaFiable("media")).toBe(false);
    expect(isConfianzaFiable("baja")).toBe(false);
    expect(isConfianzaFiable("sin_asignar")).toBe(false);
  });

  it("computeTemarioOficialData agrega practica real por tema y cuenta sin_asignar aparte", () => {
    const validas = Object.entries(topicMap).filter(([, e]) => e[0] !== null);
    const [idA] = validas[0];
    const [idB] = validas.find(([id, e]) => e[0] !== validas[0][1][0] || e[1] !== validas[0][1][1])!;
    const [idSin] = Object.entries(topicMap).find(([, e]) => e[0] === null)!;

    const data = computeTemarioOficialData([
      { question_id: idA, is_correct: true, is_blank: false },
      { question_id: idA, is_correct: false, is_blank: false },
      { question_id: idA, is_correct: null, is_blank: true },
      { question_id: idB, is_correct: true, is_blank: false },
      { question_id: idSin, is_correct: false, is_blank: false },
    ]);

    expect(data.practica.answered).toBe(3);
    expect(data.practica.correct).toBe(2);
    expect(data.practica.wrong).toBe(1);
    expect(data.practica.blank).toBe(1);
    expect(data.practica.accuracy).toBe(67);
    expect(data.practica.sinAsignacion).toBe(1);

    const temaA = data.temas.find(
      (t) => `${t.tema.bloque}.${t.tema.tema}` === `${validas[0][1][0]}.${validas[0][1][1]}`,
    )!;
    expect(temaA.practica.answered).toBe(2);
    expect(temaA.practica.blank).toBe(1);
    expect(temaA.practica.accuracy).toBe(50);

    const sinPractica = data.temas.find((t) => t.practica.answered === 0);
    expect(sinPractica?.practica.accuracy).toBeNull();
  });

  it("computeTemarioOficialData sin practica devuelve ceros y accuracy null", () => {
    const data = computeTemarioOficialData([]);
    expect(data.practica.answered).toBe(0);
    expect(data.practica.accuracy).toBeNull();
    expect(data.practica.sinAsignacion).toBe(0);
    expect(data.banco.preguntasDistintas).toBe(16348);
    expect(data.banco.filasCubiertas).toBe(77961);
  });
});
