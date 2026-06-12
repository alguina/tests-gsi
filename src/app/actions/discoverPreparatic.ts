"use server";

import { requireAdminFromCookie } from "@/app/actions/admin";
import {
  discoverPreparaticTests,
  type PreparaticDiscoveryResult,
} from "@/lib/preparaticDiscovery";

export async function discoverPreparaticTestIndex(): Promise<PreparaticDiscoveryResult> {
  await requireAdminFromCookie();
  return discoverPreparaticTests();
}
