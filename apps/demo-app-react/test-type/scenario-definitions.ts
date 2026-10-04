import type { ScenarioDefinitions } from "../src/fixtures/manifest-types";
import { elementFixtureUrls } from "@pomeranian/demo-app-react/fixture-addresses/lib-essential/element-po";

export function checkScenarioDefinitions(
  definitions: ScenarioDefinitions<typeof elementFixtureUrls>,
) {
  const { counter, ...remaining } = definitions;
  void counter;
  // @ts-expect-error Every declared address requires a registered scenario.
  const incomplete: ScenarioDefinitions<typeof elementFixtureUrls> = remaining;
  void incomplete;
  // @ts-expect-error Scenario names must belong to the address contract.
  void definitions.unknown;
  // @ts-expect-error A scenario cannot register another scenario's address.
  definitions.counter.url = elementFixtureUrls["text-collection"];
}
