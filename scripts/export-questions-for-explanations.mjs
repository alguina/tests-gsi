#!/usr/bin/env node
/**
 * Export active questions that still lack a stored explanation.
 *
 * Usage:
 *   node scripts/export-questions-for-explanations.mjs [limit]
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local
 * and writes JSON to data/explanation-queue.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIMIT = Number(process.argv[2] ?? 25);

function parseEnv(contents) {
  return Object.fromEntries(
    contents
      .split("\n")
      .map((line) => line.match(/^([^#=]+)=(.*)$/))
      .filter(Boolean)
      .map((match) => [
        match[1].trim(),
        match[2].trim().replace(/^["']|["']$/g, ""),
      ]),
  );
}

async function fetchJson(url, key, prefer) {
  const response = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(prefer ? { Prefer: prefer } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  return response.json();
}

async function main() {
  const env = parseEnv(await fs.readFile(path.join(ROOT, ".env.local"), "utf8"));
  const base = String(env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!base || !key) {
    throw new Error("Missing Supabase env in .env.local");
  }

  let explainedIds = [];
  try {
    explainedIds = await fetchJson(
      `${base}/rest/v1/question_explanations?select=question_id`,
      key,
    );
  } catch {
    explainedIds = [];
  }

  const exclude = new Set(explainedIds.map((row) => row.question_id));

  // Also skip IDs already present in local seed SQL (useful before remote seed).
  const seedDir = path.join(ROOT, "supabase");
  const seedFiles = (await fs.readdir(seedDir)).filter((name) =>
    name.startsWith("seed-question-explanations"),
  );
  for (const name of seedFiles) {
    const text = await fs.readFile(path.join(seedDir, name), "utf8");
    for (const match of text.matchAll(/'([0-9a-f-]{36})'/gi)) {
      exclude.add(match[1]);
    }
  }

  const pageSize = 1000;
  const queue = [];
  let offset = 0;

  while (queue.length < LIMIT) {
    const questions = await fetchJson(
      `${base}/rest/v1/questions?select=id,text,block,topic,year,exam,answers(letter,text,is_correct)&is_active=eq.true&order=created_at.asc&limit=${pageSize}&offset=${offset}`,
      key,
    );

    if (!Array.isArray(questions) || questions.length === 0) {
      break;
    }

    for (const question of questions) {
      if (exclude.has(question.id)) continue;
      queue.push({
        questionId: question.id,
        text: question.text,
        block: question.block,
        topic: question.topic,
        year: question.year,
        exam: question.exam,
        answers: question.answers,
        correctLetter:
          question.answers?.find((answer) => answer.is_correct)?.letter ?? null,
      });
      if (queue.length >= LIMIT) break;
    }

    offset += questions.length;
    if (questions.length < pageSize) break;
  }

  const outDir = path.join(ROOT, "data");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "explanation-queue.json");
  await fs.writeFile(outPath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${queue.length} questions -> ${path.relative(ROOT, outPath)} (excluded ${exclude.size} already seeded/remote)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
