import { describe, expect, it } from "vitest";

import topicMapRaw from "../../data/topic-map-v2.json";
import topicMapDistinctRaw from "../../data/topic-map-v2-distinct.json";
import temarioRaw from "../../data/gsi-temario-oficial.json";
import {
  TEMARIO_OFICIAL,
  getOfficialCoverage,
  getOfficialTopic,
  isConfianzaFiable,
} from "../officialTopics";

type EntradaMapa = [string | null, number | null, string];

const topicMap = topicMapRaw as unknown as Record<string, EntradaMapa>;
const topicMapDistinct = topicMapDistinctRaw as unknown as Record<string, EntradaMapa>;
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

  it("el mapa distinto cubre 16.348 preguntas con tema valido o sin_asignar explicito", () => {
    expect(Object.keys(topicMapDistinct)).toHaveLength(16348);
    for (const [bloque, tema, confianza] of Object.values(topicMapDistinct)) {
      expect(CLAVES_TEMA.has(`${bloque}.${tema}`)).toBe(true);
      expect(["alta", "media", "baja", "sin_asignar"]).toContain(confianza);
    }
  });

  it("la cobertura suma exactamente las preguntas distintas y las sin_asignar van aparte de los temas", () => {
    const cobertura = getOfficialCoverage();
    expect(cobertura.temas).toHaveLength(57);
    const totalTemas = cobertura.temas.reduce((acc, c) => acc + c.total, 0);
    expect(totalTemas + cobertura.sinAsignar).toBe(
      Object.keys(topicMapDistinct).length,
    );
    expect(cobertura.sinAsignar).toBe(1492);
    for (const c of cobertura.temas) {
      const suma = Object.values(c.porConfianza).reduce((a, b) => a + b, 0);
      expect(suma).toBe(c.total);
    }
  });

  it("getOfficialTopic resuelve cualquier id de fila y null para ids ajenos u huerfanos", () => {
    const [id, [bloque, tema]] = Object.entries(topicMap).find(
      ([, e]) => e[0] !== null,
    )!;
    const asignacion = getOfficialTopic(id);
    expect(asignacion).not.toBeNull();
    expect(asignacion?.bloque).toBe(bloque);
    expect(asignacion?.tema).toBe(tema);
    const [idHuerfano] = Object.entries(topicMap).find(([, e]) => e[0] === null)!;
    expect(getOfficialTopic(idHuerfano)).toBeNull();
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
});
