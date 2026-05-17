"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Badge } from "@/registry/new-york-v4/ui/badge";

function DemoGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function CheckMark() {
  return (
    <span className="relative size-3" aria-hidden="true">
      <span className="absolute top-1/2 left-1/2 h-1.5 w-2.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 border-current border-b border-l" />
    </span>
  );
}

function SparkMark() {
  return (
    <span className="relative size-3" aria-hidden="true">
      <span className="absolute inset-x-1 top-0 bottom-0 rounded-full bg-current opacity-70" />
      <span className="absolute inset-y-1 right-0 left-0 rounded-full bg-current opacity-70" />
    </span>
  );
}

function ArrowMark() {
  return (
    <span className="relative size-3" aria-hidden="true">
      <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-current" />
      <span className="absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rotate-45 border-current border-t border-r" />
    </span>
  );
}

export default function BadgeDemo() {
  const [dismissible, setDismissible] = useState(true);
  const [selected, setSelected] = useState(true);

  return (
    <div className="flex max-w-3xl flex-wrap items-center gap-2">
      <DemoGroup label="Basic">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="soft">Soft</Badge>
        <Badge variant="dotted">Dotted</Badge>
      </DemoGroup>

      <DemoGroup label="Matos">
        <Badge variant="surface">Surface</Badge>
        <Badge variant="inset">Inset</Badge>
        <Badge variant="tonal">Tonal</Badge>
        <Badge variant="muted">Metadata</Badge>
        <Badge variant="beta" size="xs">
          Beta
        </Badge>
        <Badge variant="new" size="xs">
          New
        </Badge>
      </DemoGroup>

      <DemoGroup label="Status">
        <Badge variant="success" dot>
          Synced
        </Badge>
        <Badge variant="warning" dot>
          Review
        </Badge>
        <Badge variant="info" dot>
          Info
        </Badge>
        <Badge variant="pending" dot>
          Pending
        </Badge>
      </DemoGroup>

      <DemoGroup label="Live">
        <Badge variant="pulse">Pulse</Badge>
        <Badge variant="live">Live</Badge>
        <Badge variant="surface" shape="dot">
          Queued
        </Badge>
      </DemoGroup>

      <DemoGroup label="Icons">
        <Badge variant="surface" iconLeft={<CheckMark />}>
          Verified
        </Badge>
        <Badge variant="inset" iconLeft={<SparkMark />}>
          AI
        </Badge>
        <Badge variant="outline" iconRight={<ArrowMark />}>
          Open
        </Badge>
      </DemoGroup>

      <DemoGroup label="Utility">
        <Badge variant="count" count={12} aria-label="12 notifications" />
        <Badge variant="count" size="xs" count={3} aria-label="3 updates" />
        <Badge variant="keyboard">⌘K</Badge>
        <Badge variant="keyboard">Esc</Badge>
      </DemoGroup>

      <DemoGroup label="Action">
        {dismissible ? (
          <Badge
            variant="surface"
            dismissible
            onDismiss={() => setDismissible(false)}
          >
            Dismissible
          </Badge>
        ) : null}
        <Badge
          variant="muted"
          interactive
          selected={selected}
          onClick={() => setSelected((value) => !value)}
        >
          Selected
        </Badge>
        <Badge variant="outline" interactive>
          Filter
        </Badge>
      </DemoGroup>
    </div>
  );
}
