import type { ComponentType } from "react";

export type ScenarioDefinition = {
  label: string;
  url: string;
  component: ComponentType;
};

export type ScenarioDefinitions<Addresses extends Record<string, string>> = {
  [Id in keyof Addresses]: ScenarioDefinition & { url: Addresses[Id] };
};

export type FixtureObject = {
  id: string;
  label: string;
  scenarios: (ScenarioDefinition & { id: string })[];
};

export type FixturePackage = {
  id: string;
  label: string;
  objects: FixtureObject[];
};
