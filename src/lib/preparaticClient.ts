export const PREPARATIC_TESTS_URL = "https://www.preparatic.org/tests/";
export const PREPARATIC_ASSETS_BASE = "https://www.preparatic.org/tests/assets";

export function extractChunkImports(source: string): string[] {
  const matches = [
    ...source.matchAll(/import\("\.\/([^"]+\.js)"\)/g),
    ...source.matchAll(/from["']\.\/([^"']+\.js)["']/g),
  ].map((match) => match[1]);

  return [...new Set(matches)];
}

export async function fetchPreparaticText(url: string): Promise<string> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "text/html,application/javascript,*/*",
        "User-Agent": "gsi-a2-study-app/0.1",
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Failed to reach remote server (${url}). Check your network connection and try again.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Remote request failed (${response.status}) for ${url}.`,
    );
  }

  return response.text();
}

export async function fetchPreparaticIndexBundleName(): Promise<string> {
  const html = await fetchPreparaticText(PREPARATIC_TESTS_URL);
  const indexScriptMatch = html.match(/assets\/(index-[a-f0-9]+\.js)/i);

  if (!indexScriptMatch) {
    throw new Error("Could not find the test index bundle in /tests/.");
  }

  return indexScriptMatch[1];
}

export async function fetchPreparaticIndexBundle(): Promise<{
  bundleName: string;
  content: string;
}> {
  const bundleName = await fetchPreparaticIndexBundleName();
  const content = await fetchPreparaticText(
    `${PREPARATIC_ASSETS_BASE}/${bundleName}`,
  );

  return { bundleName, content };
}

export async function fetchPreparaticManifestBundle(
  indexBundleContent: string,
): Promise<{ bundleName: string; content: string; scannedBundles: string[] }> {
  const scannedBundles: string[] = [];
  const indexImports = extractChunkImports(indexBundleContent);
  const testViewBundle = indexImports.find((file) =>
    file.startsWith("TestView-"),
  );

  if (testViewBundle) {
    scannedBundles.push(testViewBundle);
    const testViewContent = await fetchPreparaticText(
      `${PREPARATIC_ASSETS_BASE}/${testViewBundle}`,
    );
    const filtersBundle = extractChunkImports(testViewContent).find((file) =>
      file.startsWith("Filters-"),
    );

    if (filtersBundle) {
      scannedBundles.push(filtersBundle);
      const filtersContent = await fetchPreparaticText(
        `${PREPARATIC_ASSETS_BASE}/${filtersBundle}`,
      );

      return {
        bundleName: filtersBundle,
        content: filtersContent,
        scannedBundles,
      };
    }
  }

  const visitedChunks = new Set<string>();
  const pendingChunks = [...indexImports];

  while (pendingChunks.length) {
    const chunkFile = pendingChunks.shift();

    if (!chunkFile || visitedChunks.has(chunkFile)) {
      continue;
    }

    visitedChunks.add(chunkFile);
    scannedBundles.push(chunkFile);

    const chunkContent = await fetchPreparaticText(
      `${PREPARATIC_ASSETS_BASE}/${chunkFile}`,
    );

    if (chunkContent.includes("assets/data/tests")) {
      return {
        bundleName: chunkFile,
        content: chunkContent,
        scannedBundles,
      };
    }

    for (const nestedChunk of extractChunkImports(chunkContent)) {
      if (!visitedChunks.has(nestedChunk)) {
        pendingChunks.push(nestedChunk);
      }
    }
  }

  throw new Error(
    "Could not find the test manifest bundle (Filters chunk).",
  );
}
