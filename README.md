# tests-gsi

Private local study app milestone for GSI A2 opposition tests.

## Current milestone

- Next.js + TypeScript + Tailwind project setup
- Preparatic JavaScript parser at `src/lib/preparaticParser.ts`
- Manual paste-and-preview page for parsed questions and answers

No auth, database, scoring, AI features, deployment, or bulk import are included yet.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Next.js, paste raw Preparatic JavaScript, and click
**Parse test**. A sample fixture is preloaded so the parser can be tested quickly.
