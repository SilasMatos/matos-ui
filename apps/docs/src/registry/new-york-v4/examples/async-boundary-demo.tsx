"use client";

import { useEffect, useState } from "react";

import {
  AsyncBoundary,
  type QueryLike,
} from "@/registry/new-york-v4/ui/async-boundary";

type Task = { id: string; name: string };
type Outcome = "success" | "empty" | "error";

const TASKS: Task[] = [
  { id: "1", name: "Design review" },
  { id: "2", name: "Q3 planning" },
  { id: "3", name: "Onboarding revamp" },
];

/** A stand-in for `useQuery` — resolves after a beat to the chosen outcome. */
function useFakeQuery(outcome: Outcome, nonce: number): QueryLike<Task[]> {
  const [state, setState] = useState<QueryLike<Task[]>>({
    status: "pending",
    data: undefined,
    error: undefined,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: nonce is a re-run key — bumping it replays the fetch
  useEffect(() => {
    setState({ status: "pending", data: undefined, error: undefined });
    const timer = setTimeout(() => {
      if (outcome === "error") {
        setState({
          status: "error",
          data: undefined,
          error: new Error("HTTP 503 — the service is unavailable."),
        });
      } else {
        setState({
          status: "success",
          data: outcome === "empty" ? [] : TASKS,
          error: undefined,
        });
      }
    }, 1100);
    return () => clearTimeout(timer);
  }, [outcome, nonce]);

  return state;
}

export default function AsyncBoundaryDemo() {
  const [outcome, setOutcome] = useState<Outcome>("success");
  const [nonce, setNonce] = useState(0);
  const query = useFakeQuery(outcome, nonce);

  const run = (next: Outcome) => {
    setOutcome(next);
    setNonce((n) => n + 1);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-4 py-6">
      <div className="flex flex-wrap gap-2">
        {(["success", "empty", "error"] as const).map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={outcome === o}
            onClick={() => run(o)}
            className="rounded-lg border border-border px-2.5 py-1 font-medium text-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {o}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          className="ml-auto rounded-lg border border-border px-2.5 py-1 font-medium text-muted-foreground text-xs outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Reload
        </button>
      </div>

      <div className="rounded-xl border border-border p-4">
        <AsyncBoundary
          query={query}
          onRetry={() => run("success")}
          empty={{
            title: "No tasks",
            description: "Anything you create shows up here.",
          }}
        >
          {(tasks) => (
            <ul className="space-y-1.5">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-lg bg-muted/50 px-3 py-2 text-sm"
                >
                  {task.name}
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </div>
    </div>
  );
}
