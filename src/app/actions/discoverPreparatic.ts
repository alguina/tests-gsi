"use server";

import {
  discoverPreparaticTests,
  type PreparaticDiscoveryResult,
} from "@/lib/preparaticDiscovery";

export async function discoverPreparaticTestIndex(): Promise<PreparaticDiscoveryResult> {
  return discoverPreparaticTests();
}
