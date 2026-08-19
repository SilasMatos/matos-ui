"use client";

import { useCallback, useRef, useState } from "react";
import {
  LiveQueue,
  LiveQueueItem,
  type LiveQueueItemData,
} from "@/registry/new-york-v4/ui/live-queue";

const seedItems: LiveQueueItemData[] = [
  {
    id: "deploy-1",
    title: "Deploy to production",
    description: "apps/docs · main@a91f3c2",
    status: "running",
  },
  {
    id: "deploy-2",
    title: "Run test suite",
    description: "24 suites · 312 tests",
    status: "pending",
  },
  {
    id: "deploy-3",
    title: "Build preview",
    description: "PR #482 · feature/customize-radius",
    status: "done",
  },
];

export default function LiveQueueDemo() {
  const [items, setItems] = useState<LiveQueueItemData[]>(seedItems);
  const counterRef = useRef(seedItems.length);

  const addItem = useCallback(() => {
    counterRef.current += 1;
    const id = `deploy-${counterRef.current}`;
    const prNumber = 480 + counterRef.current;

    setItems((current) => [
      ...current,
      {
        id,
        title: "Deploy to staging",
        description: `PR #${prNumber} · queued just now`,
        status: "pending",
      },
    ]);

    // Simulate the queue actually moving, so the entrance/exit motion has
    // something real to demonstrate: pending -> running -> done/failed.
    window.setTimeout(() => {
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "running" } : item,
        ),
      );
    }, 900);

    window.setTimeout(() => {
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: Math.random() > 0.25 ? "done" : "failed" }
            : item,
        ),
      );
    }, 2800);
  }, []);

  const handleItemComplete = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <button
        type="button"
        onClick={addItem}
        className="inline-flex h-8 w-fit items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        Queue a deploy
      </button>

      {items.length > 0 ? (
        <LiveQueue
          items={items}
          onItemComplete={handleItemComplete}
          aria-label="Deploy queue"
        >
          {(item) => <LiveQueueItem key={item.id} item={item} />}
        </LiveQueue>
      ) : (
        <p className="text-sm text-muted-foreground">Queue is empty.</p>
      )}
    </div>
  );
}
