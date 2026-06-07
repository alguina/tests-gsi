# AGENTS.md

## Cursor Cloud specific instructions

### Repository layout

- `main` contains only the initial README stub (no application code).
- The runnable Next.js app lives on branch `cursor/preparatic-parser-preview-941a` (or any branch that includes `package.json`).

### Product

Private study app for parsing **Preparatic GSI A2** opposition test bundles. Single-page Next.js app: paste raw JavaScript, click **Parse test**, review extracted questions/answers locally. No database, auth, or external APIs.

### Services

| Service | Required | Start |
|---------|----------|-------|
| Next.js dev server | Yes | `npm run dev` (default port 3000) |

No Docker, database, or other backing services.

### Commands

See `README.md` and `package.json` scripts:

- **Install:** `npm ci` (when `package-lock.json` is present)
- **Dev:** `npm run dev`
- **Lint:** `npm run lint`
- **Build:** `npm run build`

### Hello-world verification

1. `npm run dev` and open `http://localhost:3000`
2. Sample Preparatic JS is preloaded in the textarea
3. Click **Parse test** — expect title "GSI A2 Opposition Sample", 2 questions, correct answers highlighted

CLI alternative: `npx tsx -e "import { parsePreparaticTest } from './src/lib/preparaticParser.ts'; import { preparaticSample } from './src/fixtures/preparaticSample.ts'; console.log(parsePreparaticTest(preparaticSample).questions.length)"` → should print `2`.

### Notes

- Node.js 22+ works with the current lockfile.
- `NEXT_TELEMETRY_DISABLED=1` can silence Next.js telemetry prompts in CI/automation.
- There is no `npm test` script yet; validate via lint, build, and manual/CLI parser check above.
