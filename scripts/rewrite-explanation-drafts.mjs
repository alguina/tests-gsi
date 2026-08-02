#!/usr/bin/env node
/**
 * Improve drafted explanations using question+answers context.
 *
 * Usage:
 *   node scripts/rewrite-explanation-drafts.mjs data/explanation-queue.json data/explanations-batch-00N.json
 */

import fs from "node:fs/promises";
import path from "node:path";

function inferSources(question) {
  const hay = `${question.text ?? ""} ${question.topic ?? ""} ${question.block ?? ""}`.toLowerCase();

  if (/constituci[oó]n|ce\s*1978/.test(hay)) {
    return [{ title: "Constitución Española (BOE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229" }];
  }
  if (/ley\s*39\/2015|procedimiento administrativo|lpac/.test(hay)) {
    return [{ title: "Ley 39/2015 LPAC", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565" }];
  }
  if (/ley\s*40\/2015|r[eé]gimen jur[ií]dico/.test(hay)) {
    return [{ title: "Ley 40/2015 RJSP", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566" }];
  }
  if (/ebep|empleado p[uú]blico/.test(hay)) {
    return [{ title: "EBEP (RDL 5/2015)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11719" }];
  }
  if (/ens|esquema nacional de seguridad/.test(hay)) {
    return [{ title: "ENS", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191" }];
  }
  if (/lcsp|contratos del sector p[uú]blico|9\/2017/.test(hay)) {
    return [{ title: "LCSP", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902" }];
  }
  if (/protecci[oó]n de datos|lopdgdd|rgpd|3\/2018/.test(hay)) {
    return [{ title: "LOPDGDD", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673" }];
  }
  if (/uni[oó]n europea|tratado|parlamento europeo|consejo de la ue/.test(hay)) {
    return [{ title: "Instituciones UE", url: "https://european-union.europa.eu/" }];
  }
  if (/red|vlan|ethernet|tcp|ip|osi|firewall|voip|fiber|cable|gprs/.test(hay)) {
    return [{ title: "Conceptos de redes", url: "https://en.wikipedia.org/wiki/Computer_network" }];
  }
  if (/uml|m[eé]trica|rup|requisitos|software|pert|cocomo|scrum|agile/.test(hay)) {
    return [{ title: "Ingeniería del software", url: "https://en.wikipedia.org/wiki/Software_engineering" }];
  }
  if (/administraci[oó]n electr[oó]nica|sara|sede electr[oó]nica/.test(hay)) {
    return [{ title: "Administración electrónica", url: "https://administracionelectronica.gob.es/" }];
  }
  return [{ title: "Referencia temática (revisar)", url: "https://www.boe.es/" }];
}

function rewrite(question) {
  const answers = Array.isArray(question.answers) ? question.answers : [];
  const correct = answers.find((answer) => answer.is_correct);
  const others = answers.filter((answer) => !answer.is_correct);
  const letter = correct?.letter ?? question.correctLetter ?? "?";
  const text = String(question.text ?? "");
  const asksFalse =
    /\b(NO|FALSA|FALSO|INCORRECTA|INCORRECTO|no es|no está|no se|señale la falsa|señale la incorrecta|señale cuál.*NO)\b/i.test(
      text,
    );
  const allAbove = /todas las (respuestas|anteriores)/i.test(String(correct?.text ?? ""));

  let explanation;
  let whyCorrect;
  let whyOthers;

  if (asksFalse) {
    explanation = `La opción incorrecta/falsa es ${letter}: ${correct?.text ?? ""}. Las demás afirmaciones sí encajan con el enunciado o la norma/técnica de referencia.`;
    whyCorrect = `${letter} es la que NO cumple el criterio pedido (la falsa/incorrecta).`;
    whyOthers =
      others.map((answer) => `${answer.letter} sí es coherente o verdadera en este contexto`).join("; ") +
      ".";
  } else if (allAbove) {
    explanation = `Todas las afirmaciones previas son correctas; por eso la respuesta es ${letter}.`;
    whyCorrect = `${letter} recoge que el resto de opciones verdaderas se cumplen.`;
    whyOthers = "Las opciones parciales no agotan el conjunto correcto.";
  } else {
    explanation = `${letter} es correcta: ${correct?.text ?? ""}.`;
    whyCorrect = "Coincide con el criterio normativo o técnico que exige la pregunta.";
    whyOthers =
      others
        .map(
          (answer) =>
            `${answer.letter} («${String(answer.text ?? "").slice(0, 90)}») no cumple ese criterio`,
        )
        .join("; ") + ".";
  }

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
  const queuePath = process.argv[2];
  const batchPath = process.argv[3];
  if (!queuePath || !batchPath) {
    throw new Error(
      "Usage: node scripts/rewrite-explanation-drafts.mjs <queue.json> <batch.json>",
    );
  }

  const queue = JSON.parse(await fs.readFile(path.resolve(queuePath), "utf8"));
  const byId = new Map(queue.map((row) => [row.questionId, row]));
  const rows = JSON.parse(await fs.readFile(path.resolve(batchPath), "utf8"));

  const rewritten = rows.map((row) => {
    const question = byId.get(row.questionId);
    return question ? rewrite(question) : row;
  });

  await fs.writeFile(path.resolve(batchPath), `${JSON.stringify(rewritten, null, 2)}\n`);
  console.log(`Rewrote ${rewritten.length} explanations -> ${batchPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
