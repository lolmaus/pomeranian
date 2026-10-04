import { pageObjectFixtures } from "./page-object/manifest";
import type { FixturePackage } from "../manifest-types";

export const coreFixtures: FixturePackage = {
  id: "core",
  label: "core",
  objects: [pageObjectFixtures],
};
