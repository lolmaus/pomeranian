import { essentialFixtures } from "./lib-essential/manifest";
import { coreFixtures } from "./core/manifest";
import type { FixturePackage } from "./manifest-types";

export const fixturePackages: FixturePackage[] = [coreFixtures, essentialFixtures];
