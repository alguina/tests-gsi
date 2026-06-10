"use server";

import {
  importPreparaticFromInput,
  type PreparaticImportResult,
} from "@/lib/preparaticImport";

export async function importFromPreparaticUrl(
  input: string,
): Promise<PreparaticImportResult> {
  return importPreparaticFromInput(input);
}
