"use server";

import { getDatabaseStats, type DatabaseStats } from "@/lib/databaseStats";
import {
  importDiscoveredTest,
  type BulkImportTestInput,
  type BulkImportTestLog,
} from "@/lib/preparaticBulkImport";

export async function importDiscoveredPreparaticTest(
  input: BulkImportTestInput,
): Promise<BulkImportTestLog> {
  return importDiscoveredTest(input);
}

export async function fetchDatabaseStats(): Promise<DatabaseStats> {
  return getDatabaseStats();
}
