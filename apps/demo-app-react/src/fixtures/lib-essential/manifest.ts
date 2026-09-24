import { elementFixtures } from "./element-po/manifest";
import type { FixturePackage } from "../manifest-types";

export const essentialFixtures: FixturePackage = {
  id: "lib-essential",
  label: "lib-essential",
  objects: [elementFixtures],
};
