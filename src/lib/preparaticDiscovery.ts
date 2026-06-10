import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  PREPARATIC_ASSETS_BASE,
  PREPARATIC_TESTS_URL,
  fetchPreparaticIndexBundle,
  fetchPreparaticManifestBundle,
} from "@/lib/preparaticClient";

const CATALOG_CATEGORIES = [
  "random",
  "weighted",
  "block",
  "topic",
  "year",
  "exam",
] as const;

const HASH_PATTERN = /hash:"([a-f0-9]{32})"/gi;
const TEST_URL_BASE = `${PREPARATIC_TESTS_URL}#/test/`;

export type DiscoveredTest = {
  hash: string;
  title: string;
  date: string | null;
  type: string;
  testUrl: string;
  assetUrl: string | null;
  block: string | null;
  topic: string | null;
  year: string | null;
  description: string | null;
  importStatus: "imported" | "not_imported";
};

export type PreparaticDiscoveryResult = {
  indexFound: boolean;
  bundlesScanned: string[];
  candidateHashes: string[];
  tests: DiscoveredTest[];
  diagnostics: {
    errors: string[];
    catalogEntriesFound: number;
    uniqueTestsExtracted: number;
    assetMappingsFound: number;
    importedCount: number;
    notImportedCount: number;
  };
};

type CatalogEntry = {
  hash: string;
  title: string;
  date: string | null;
  type: string;
  block: string | null;
  topic: string | null;
  year: string | null;
  description: string | null;
};

export async function discoverPreparaticTests(): Promise<PreparaticDiscoveryResult> {
  const errors: string[] = [];
  const bundlesScanned: string[] = [];

  const { bundleName: indexBundleName, content: indexBundleContent } =
    await fetchPreparaticIndexBundle();
  bundlesScanned.push(indexBundleName);

  const candidateHashes = extractCandidateHashes(indexBundleContent);
  const catalogEntries = extractCatalogEntries(indexBundleContent);
  const indexFound = catalogEntries.length > 0;

  if (!indexFound) {
    errors.push(
      "No explicit test catalog was found in the index bundle. Showing hash candidates only.",
    );
  }

  let assetMappings = new Map<string, string>();

  try {
    const manifest = await fetchPreparaticManifestBundle(indexBundleContent);
    bundlesScanned.push(...manifest.scannedBundles);
    assetMappings = extractAssetMappings(manifest.content);
  } catch (manifestError) {
    errors.push(
      manifestError instanceof Error
        ? manifestError.message
        : "Could not load the test asset manifest bundle.",
    );
  }

  const testsByHash = new Map<string, CatalogEntry>();

  if (indexFound) {
    for (const entry of catalogEntries) {
      testsByHash.set(entry.hash, entry);
    }
  } else {
    for (const hash of candidateHashes) {
      testsByHash.set(hash, {
        hash,
        title: "Unknown title",
        date: null,
        type: "candidate",
        block: null,
        topic: null,
        year: null,
        description: null,
      });
    }
  }

  for (const hash of candidateHashes) {
    if (!testsByHash.has(hash)) {
      testsByHash.set(hash, {
        hash,
        title: "Unknown title",
        date: null,
        type: "candidate",
        block: null,
        topic: null,
        year: null,
        description: null,
      });
    }
  }

  const importedHashes = await fetchImportedSourceHashes([
    ...testsByHash.keys(),
  ]);

  const tests = [...testsByHash.values()]
    .map((entry) => ({
      hash: entry.hash,
      title: entry.title,
      date: entry.date,
      type: entry.type,
      testUrl: `${TEST_URL_BASE}${entry.hash}`,
      assetUrl: assetMappings.get(entry.hash) ?? null,
      block: entry.block,
      topic: entry.topic,
      year: entry.year,
      description: entry.description,
      importStatus: importedHashes.has(entry.hash)
        ? ("imported" as const)
        : ("not_imported" as const),
    }))
    .sort((left, right) => {
      const typeCompare = left.type.localeCompare(right.type);
      if (typeCompare !== 0) {
        return typeCompare;
      }

      return left.title.localeCompare(right.title, "es");
    });

  const importedCount = tests.filter(
    (test) => test.importStatus === "imported",
  ).length;

  return {
    indexFound,
    bundlesScanned: [...new Set(bundlesScanned)],
    candidateHashes,
    tests,
    diagnostics: {
      errors,
      catalogEntriesFound: catalogEntries.length,
      uniqueTestsExtracted: tests.length,
      assetMappingsFound: assetMappings.size,
      importedCount,
      notImportedCount: tests.length - importedCount,
    },
  };
}

function extractCatalogEntries(indexBundleContent: string): CatalogEntry[] {
  const catalogObject = extractCatalogObject(indexBundleContent);

  if (!catalogObject) {
    return [];
  }

  const entries: CatalogEntry[] = [];

  for (const category of CATALOG_CATEGORIES) {
    const arrayBody = extractCategoryArrayBody(catalogObject, category);

    if (!arrayBody) {
      continue;
    }

    for (const objectBody of splitObjectLiterals(arrayBody)) {
      const fields = parseObjectFields(objectBody);
      const hash = fields.hash?.toLowerCase();

      if (!hash) {
        continue;
      }

      entries.push({
        hash,
        title: fields.title || "Untitled test",
        date: fields.date ?? null,
        type: category,
        block: fields.block ?? null,
        topic: fields.topic ?? null,
        year: fields.year ?? null,
        description: fields.description ?? null,
      });
    }
  }

  return entries;
}

function extractCatalogObject(indexBundleContent: string): string | null {
  const catalogStart = indexBundleContent.indexOf("a8={");

  if (catalogStart === -1) {
    return null;
  }

  let depth = 0;

  for (let index = catalogStart + 3; index < indexBundleContent.length; index++) {
    const character = indexBundleContent[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return indexBundleContent.slice(catalogStart + 3, index);
      }
    }
  }

  return null;
}

function extractCategoryArrayBody(
  catalogObject: string,
  category: string,
): string | null {
  const marker = `${category}:[`;
  const start = catalogObject.indexOf(marker);

  if (start === -1) {
    return null;
  }

  let depth = 0;

  for (
    let index = start + marker.length - 1;
    index < catalogObject.length;
    index++
  ) {
    const character = catalogObject[index];

    if (character === "[") {
      depth += 1;
    } else if (character === "]") {
      depth -= 1;

      if (depth === 0) {
        return catalogObject.slice(start + marker.length, index);
      }
    }
  }

  return null;
}

function splitObjectLiterals(arrayBody: string): string[] {
  const objects: string[] = [];
  let depth = 0;
  let start = -1;

  for (let index = 0; index < arrayBody.length; index++) {
    const character = arrayBody[index];

    if (character === "{") {
      if (depth === 0) {
        start = index + 1;
      }

      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0 && start !== -1) {
        objects.push(arrayBody.slice(start, index));
        start = -1;
      }
    }
  }

  return objects;
}

function parseObjectFields(objectBody: string): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const match of objectBody.matchAll(/([a-zA-Z]+):"([^"]*)"/g)) {
    fields[match[1]] = match[2];
  }

  return fields;
}

function extractCandidateHashes(bundleContent: string): string[] {
  const hashes = new Set<string>();

  for (const match of bundleContent.matchAll(HASH_PATTERN)) {
    hashes.add(match[1].toLowerCase());
  }

  return [...hashes].sort();
}

function extractAssetMappings(manifestBundleContent: string): Map<string, string> {
  const mappings = new Map<string, string>();

  for (const match of manifestBundleContent.matchAll(
    /\.\/([a-f0-9]{32})-([a-f0-9]{8})\.js/gi,
  )) {
    const hash = match[1].toLowerCase();
    mappings.set(
      hash,
      `${PREPARATIC_ASSETS_BASE}/${hash}-${match[2].toLowerCase()}.js`,
    );
  }

  return mappings;
}

async function fetchImportedSourceHashes(
  hashes: string[],
): Promise<Set<string>> {
  if (!hashes.length) {
    return new Set();
  }

  const supabase = createServerSupabaseClient();
  const imported = new Set<string>();
  const batchSize = 100;

  for (let index = 0; index < hashes.length; index += batchSize) {
    const batch = hashes.slice(index, index + batchSize);
    const { data, error } = await supabase
      .from("sources")
      .select("external_id")
      .in("external_id", batch);

    if (error) {
      throw new Error(
        `Failed to check imported sources in Supabase: ${error.message}`,
      );
    }

    for (const row of data ?? []) {
      if (row.external_id) {
        imported.add(row.external_id.toLowerCase());
      }
    }
  }

  return imported;
}
