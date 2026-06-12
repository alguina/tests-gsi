"use server";

import { requireAdminFromCookie } from "@/app/actions/admin";
import {
  importPreparaticFromInput,
  type PreparaticImportResult,
} from "@/lib/preparaticImport";

export async function importFromPreparaticUrl(
  input: string,
): Promise<PreparaticImportResult> {
  await requireAdminFromCookie();
  return importPreparaticFromInput(input);
}
