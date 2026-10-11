import { useEffect, useState } from "react";
import { reactStory } from "@pomeranian/tests-e2e/react";

export const StyledNeighbor = reactStory(() => (
  <section>
    <style>{`#root button { color: rgb(120, 20, 90); background: rgb(230, 180, 220); font: italic 24px serif; padding: 40px; }`}</style>
    <button>Neighbor</button>
  </section>
));

export type SessionProps = { label: string; fail?: boolean };

export const Session = reactStory(function Session({ label, fail = false }: SessionProps) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.body.dataset.storyActive = "true";
    return () => {
      delete document.body.dataset.storyActive;
    };
  }, []);
  if (fail) throw new Error("story render failed");
  return (
    <button onClick={() => setCount((current) => current + 1)}>
      {label}: {count}
    </button>
  );
});
