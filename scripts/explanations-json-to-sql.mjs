#!/usr/bin/env node
/**
 * Convert a JSON explanations batch into upsert SQL.
 *
 * Input JSON shape:
 * [
 *   {
 *     "questionId": "uuid",
 *     "explanation": "...",
 *     "whyCorrect": "...",
 *     "whyOthers": "...",
 *     "sources": [{ "title": "...", "url": "..." }],
 *     "status": "draft"
 *   }
 * ]
 *
 * Usage:
 *   node scripts/explanations-json-to-sql.mjs data/explanations-batch-002.json supabase/seed-question-explanations-batch-002.sql
 */

import fs from "node:fs/promises";
import path from "node:path";

function sqlString(value) {
  return `'${String(value ?? "").replace(/'/g, "''")}'`;
}

function toSql(rows) {
  const values = rows.map((row) => {
    const sources = JSON.stringify(row.sources ?? []);
    return `(
  ${sqlString(row.questionId)},
  ${sqlString(row.explanation)},
  ${row.whyCorrect ? sqlString(row.whyCorrect) : "null"},
  ${row.whyOthers ? sqlString(row.whyOthers) : "null"},
  ${sqlString(sources)}::jsonb,
  ${sqlString(row.status ?? "draft")},
  now(),
  now()
)`;
  });

  return `-- Auto-generated explanation seed. Safe to re-run (upsert).
insert into public.question_explanations (
  question_id,
  explanation,
  why_correct,
  why_others,
  sources,
  status,
  generated_at,
  updated_at
)
values
${values.join(",\n")}
on conflict (question_id) do update set
  explanation = excluded.explanation,
  why_correct = excluded.why_correct,
  why_others = excluded.why_others,
  sources = excluded.sources,
  status = excluded.status,
  updated_at = now();
`;
}

async function main() {
  const input = process.argv[2];
  const output = process.argv[3];

  if (!input || !output) {
    throw new Error(
      "Usage: node scripts/explanations-json-to-sql.mjs <input.json> <output.sql>",
    );
  }

  const rows = JSON.parse(await fs.readFile(path.resolve(input), "utf8"));
  if (!Array.isArray(rows) || !rows.length) {
    throw new Error("Input JSON must be a non-empty array");
  }

  await fs.writeFile(path.resolve(output), toSql(rows), "utf8");
  console.log(`Wrote ${rows.length} explanations -> ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
