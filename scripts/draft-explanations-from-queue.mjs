#!/usr/bin/env node
/**
 * Draft structured explanations from an exported queue.
 * Prefer human review before marking status=reviewed.
 *
 * Usage:
 *   node scripts/draft-explanations-from-queue.mjs data/explanation-queue.json data/explanations-batch-003.json
 */

import fs from "node:fs/promises";
import path from "node:path";

function inferSources(question) {
  const hay = `${question.text ?? ""} ${question.topic ?? ""} ${question.block ?? ""}`.toLowerCase();

  if (/constituci[oó]n|ce\s*1978|t[ií]tulo\s+preliminar/.test(hay)) {
    return [
      {
        title: "Constitución Española (BOE)",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
      },
    ];
  }
  if (/ley\s*39\/2015|procedimiento administrativo|lpac/.test(hay)) {
    return [
      {
        title: "Ley 39/2015 LPAC",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565",
      },
    ];
  }
  if (/ley\s*40\/2015|r[eé]gimen jur[ií]dico|sector p[uú]blico/.test(hay)) {
    return [
      {
        title: "Ley 40/2015 RJSP",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566",
      },
    ];
  }
  if (/ebep|empleado p[uú]blico|estatuto b[aá]sico/.test(hay)) {
    return [
      {
        title: "EBEP (RDL 5/2015)",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11719",
      },
    ];
  }
  if (/transparencia|19\/2013|buen gobierno/.test(hay)) {
    return [
      {
        title: "Ley 19/2013 de Transparencia",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2013-12887",
      },
    ];
  }
  if (/ens|esquema nacional de seguridad|rd\s*311\/2022|rd\s*3\/2010/.test(hay)) {
    return [
      {
        title: "Esquema Nacional de Seguridad",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191",
      },
    ];
  }
  if (/lcsp|contratos del sector p[uú]blico|9\/2017/.test(hay)) {
    return [
      {
        title: "Ley 9/2017 LCSP",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902",
      },
    ];
  }
  if (/uni[oó]n europea|tratado|comisi[oó]n europea|consejo de la ue|parlamento europeo/.test(hay)) {
    return [
      {
        title: "Instituciones de la UE",
        url: "https://european-union.europa.eu/institutions-law-budget/institutions-and-bodies_es",
      },
    ];
  }
  if (/osi|tcp\/ip|red|firewall|cortafuegos|ssl|tls|http/.test(hay)) {
    return [
      {
        title: "Conceptos de redes",
        url: "https://en.wikipedia.org/wiki/Computer_network",
      },
    ];
  }
  if (/sql|base de datos|entidad.?relaci[oó]n|normalizaci[oó]n/.test(hay)) {
    return [
      {
        title: "Bases de datos",
        url: "https://en.wikipedia.org/wiki/Database",
      },
    ];
  }
  if (/scrum|agile|[aá]gil|pmbok|efqm/.test(hay)) {
    return [
      {
        title: "Gestión de proyectos / calidad",
        url: "https://en.wikipedia.org/wiki/Project_management",
      },
    ];
  }
  if (/administraci[oó]n electr[oó]nica|sara|sede electr[oó]nica|guia de comunicaci[oó]n/.test(hay)) {
    return [
      {
        title: "Administración electrónica",
        url: "https://administracionelectronica.gob.es/",
      },
    ];
  }

  return [
    {
      title: "Referencia temática (revisar)",
      url: "https://www.boe.es/",
    },
  ];
}

function draftFromQuestion(question) {
  const answers = Array.isArray(question.answers) ? question.answers : [];
  const correct =
    answers.find((answer) => answer.is_correct) ??
    answers.find((answer) => answer.letter === question.correctLetter);
  const others = answers.filter((answer) => answer !== correct);
  const letter = correct?.letter ?? question.correctLetter ?? "?";
  const correctText = String(correct?.text ?? "").trim();
  const otherLetters = others.map((answer) => answer.letter).filter(Boolean).join(", ");

  const explanation = correctText
    ? `La respuesta correcta es ${letter}: ${correctText}`
    : `La respuesta correcta es la opción ${letter}.`;

  const whyCorrect = correctText
    ? `${letter} es correcta porque recoge el criterio o enunciado normativo/técnico que pide la pregunta.`
    : `La opción ${letter} es la que coincide con el criterio correcto del enunciado.`;

  const whyOthers = others.length
    ? `${otherLetters || "Las demás"} se descartan porque no coinciden con el criterio correcto${
        others
          .slice(0, 3)
          .map((answer) => ` (${answer.letter}: ${String(answer.text ?? "").slice(0, 80)})`)
          .join("")
      }.`
    : "Las demás opciones no cumplen el criterio correcto del enunciado.";

  return {
    questionId: question.questionId,
    explanation,
    whyCorrect,
    whyOthers,
    sources: inferSources(question),
    status: "draft",
  };
}

async function main() {
  const input = process.argv[2];
  const output = process.argv[3];

  if (!input || !output) {
    throw new Error(
      "Usage: node scripts/draft-explanations-from-queue.mjs <queue.json> <out.json>",
    );
  }

  const queue = JSON.parse(await fs.readFile(path.resolve(input), "utf8"));
  if (!Array.isArray(queue) || !queue.length) {
    throw new Error("Queue JSON must be a non-empty array");
  }

  const rows = queue.map(draftFromQuestion);
  await fs.writeFile(path.resolve(output), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  console.log(`Drafted ${rows.length} explanations -> ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
