import { reactStory } from "@pomeranian/tests-e2e/react";
import { useState } from "react";

export const Counter = reactStory(function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button data-test="counter" onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </button>
  );
});
