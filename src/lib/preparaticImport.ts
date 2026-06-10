import { parsePreparaticTest, type ParsedTest } from "@/lib/preparaticParser";
import {
  PREPARATIC_ASSETS_BASE,
  extractChunkImports,
  fetchPreparaticIndexBundleName,
  fetchPreparaticText,
} from "@/lib/preparaticClient";

const ASSET_URL_PATTERN =
  /^https?:\/\/(?:www\.)?preparatic\.org\/tests\/assets\/([a-f0-9]{32})-([a-f0-9]{8})\.js\/?$/i;

const TEST_HASH_PATTERN = /(?:#\/test\/|\/test\/)([a-f0-9]{32})\/?$/i;

export class PreparaticAssetDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreparaticAssetDiscoveryError";
  }
}

export type PreparaticInput =
  | { kind: "asset"; assetUrl: string; testHash: string }
  | { kind: "test"; testHash: string; sourceUrl: string };

export type PreparaticImportResult = {
  sourceUrl: string;
  assetUrl: string;
  rawJs: string;
  parsedTest: ParsedTest;
};

export function parsePreparaticInput(input: string): PreparaticInput {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Paste a test URL or direct JS asset URL.");
  }

  const assetMatch = trimmed.match(ASSET_URL_PATTERN);
  if (assetMatch) {
    return {
      kind: "asset",
      assetUrl: normalizeAssetUrl(trimmed),
      testHash: assetMatch[1].toLowerCase(),
    };
  }

  let candidate = trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hash) {
      candidate = `${url.origin}${url.pathname}${url.hash}`;
    }
  } catch {
    // Keep the raw string and try regex-based hash extraction below.
  }

  const hashMatch = candidate.match(TEST_HASH_PATTERN);
  if (hashMatch) {
    return {
      kind: "test",
      testHash: hashMatch[1].toLowerCase(),
      sourceUrl: trimmed,
    };
  }

  throw new Error(
    "Unrecognized URL. Paste a visible test URL (#/test/...) or a direct /tests/assets/...js URL.",
  );
}

export async function importPreparaticFromInput(
  input: string,
): Promise<PreparaticImportResult> {
  const parsedInput = parsePreparaticInput(input);
  const sourceUrl =
    parsedInput.kind === "test" ? parsedInput.sourceUrl : parsedInput.assetUrl;

  const assetUrl =
    parsedInput.kind === "asset"
      ? parsedInput.assetUrl
      : await discoverAssetUrl(parsedInput.testHash);

  const rawJs = await fetchPreparaticText(assetUrl);
  const parsedTest = parsePreparaticTest(rawJs);

  return {
    sourceUrl,
    assetUrl,
    rawJs,
    parsedTest,
  };
}

async function discoverAssetUrl(testHash: string): Promise<string> {
  const indexBundleName = await fetchPreparaticIndexBundleName();
  const indexJs = await fetchPreparaticText(
    `${PREPARATIC_ASSETS_BASE}/${indexBundleName}`,
  );

  const visitedChunks = new Set<string>();
  const pendingChunks = extractChunkImports(indexJs);

  while (pendingChunks.length) {
    const chunkFile = pendingChunks.shift();

    if (!chunkFile || visitedChunks.has(chunkFile)) {
      continue;
    }

    visitedChunks.add(chunkFile);

    const chunkJs = await fetchPreparaticText(
      `${PREPARATIC_ASSETS_BASE}/${chunkFile}`,
    );

    const assetFileMatch = chunkJs.match(
      new RegExp(`${testHash}-[a-f0-9]{8}\\.js`, "i"),
    );

    if (assetFileMatch) {
      return `${PREPARATIC_ASSETS_BASE}/${assetFileMatch[0]}`;
    }

    for (const nestedChunk of extractChunkImports(chunkJs)) {
      if (!visitedChunks.has(nestedChunk)) {
        pendingChunks.push(nestedChunk);
      }
    }
  }

  throwDiscoveryError(testHash);
}

function throwDiscoveryError(testHash: string): never {
  throw new PreparaticAssetDiscoveryError(
    `Could not find a JS asset starting with "${testHash}" under /tests/assets/. Open DevTools → Network, reload the test page, and paste the direct asset URL (for example .../tests/assets/${testHash}-xxxxxxxx.js).`,
  );
}

function normalizeAssetUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  const match = trimmed.match(ASSET_URL_PATTERN);

  if (!match) {
    throw new Error("Invalid test asset URL.");
  }

  return `${PREPARATIC_ASSETS_BASE}/${match[1].toLowerCase()}-${match[2].toLowerCase()}.js`;
}
