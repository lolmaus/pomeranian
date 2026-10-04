import { lazy } from "react";
import { pageObjectFixtureUrls } from "./addresses.mts";
import type { FixtureObject, ScenarioDefinitions } from "../../manifest-types";

const definitions = {
  counter: {
    label: "Locator counter",
    url: pageObjectFixtureUrls.counter,
    component: lazy(() => import("./counter").then((module) => ({ default: module.Counter }))),
  },
} satisfies ScenarioDefinitions<typeof pageObjectFixtureUrls>;

export const pageObjectFixtures: FixtureObject = {
  id: "page-object",
  label: "PageObject",
  scenarios: Object.entries(definitions).map(([id, definition]) => ({ id, ...definition })),
};
