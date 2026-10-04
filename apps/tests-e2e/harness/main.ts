import type { Story, StoryInstance } from "./story.ts";

const packageModules = import.meta.glob<Record<string, Story>>(
  "../../../packages/*/src/**/*.stories.tsx",
);
const harnessModules = import.meta.glob<Record<string, Story>>("../src/**/*.stories.tsx");
const modules = new Map(
  [...Object.entries(packageModules), ...Object.entries(harnessModules)].map(([path, load]) => [
    path
      .replace("../../../packages/", "")
      .replace("../src/", "tests-e2e/")
      .replace("/src/", "/")
      .replace(/\.stories\.tsx$/, ""),
    load,
  ]),
);
const host = document.getElementById("root");
if (!host) throw new Error("The story harness requires #root");

let active: { id: string; instance: StoryInstance } | undefined;

window.unmount = async () => {
  const previous = active;
  active = undefined;
  await previous?.instance.unmount();
  host.replaceChildren();
};

window.mount = async ({ story: id, props = {} }) => {
  if (active?.id !== id) {
    const separator = id.lastIndexOf("/");
    const load = modules.get(id.slice(0, separator));
    const stories = await load?.();
    const story = stories?.[id.slice(separator + 1)];
    if (!story || typeof story.create !== "function") throw new Error(`Unknown story: ${id}`);
    await window.unmount();
    active = { id, instance: await story.create(host) };
  }
  try {
    await active.instance.render(props);
  } catch (error) {
    await window.unmount();
    throw error;
  }
};
