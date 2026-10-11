import { reactStory } from "@pomeranian/tests-e2e/react";
import { useEffect, useRef, useState } from "react";

export type CounterProps = { delayUpdates?: boolean; replaceable?: boolean };

export const Counter = reactStory(function Counter({
  delayUpdates = false,
  replaceable = false,
}: CounterProps) {
  const [count, setCount] = useState(0);
  const [generation, setGeneration] = useState(0);
  const [pending, setPending] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function increment() {
    if (delayUpdates) {
      setPending(true);
      timer.current = window.setTimeout(() => {
        setCount((current) => current + 1);
        setPending(false);
      }, 250);
    } else {
      setCount((current) => current + 1);
    }
  }

  return (
    <main>
      <button key={generation} data-test="counter" disabled={pending} onClick={increment}>
        Count: {count}
      </button>
      {replaceable && (
        <button onClick={() => setGeneration((current) => current + 1)}>Replace button</button>
      )}
    </main>
  );
});

export const TextCollection = reactStory(() => (
  <ol>
    <li data-test="text-sample">
      Alpha<span hidden> detail</span>
    </li>
    <li data-test="text-sample">Beta</li>
  </ol>
));
