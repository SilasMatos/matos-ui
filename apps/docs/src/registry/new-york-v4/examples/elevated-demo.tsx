"use client";

import { cn } from "@/lib/utils";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

/** Concentric ladder — each layer lifts one step off the one it sits in. */
function Ladder({ steps }: { steps: number }) {
  if (steps <= 0) {
    return (
      <div className="grid size-12 place-items-center rounded-lg bg-surface-8 shadow-surface-8">
        <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
          8
        </span>
      </div>
    );
  }

  return (
    <Elevated
      offset={1}
      className="flex items-center justify-center rounded-2xl p-3.5"
    >
      <Ladder steps={steps - 1} />
    </Elevated>
  );
}

/** A popover reads the same whether it opens on the page or inside a dialog. */
function FakePopover({ label }: { label: string }) {
  return (
    <Elevated
      offset={2}
      shadowLevel={3}
      className="space-y-1 rounded-xl p-2 text-xs"
    >
      <p className="px-1.5 pb-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="rounded-lg px-2 py-1.5 text-foreground">Rename</div>
      <div className="rounded-lg px-2 py-1.5 text-foreground">Duplicate</div>
      <div className="rounded-lg px-2 py-1.5 text-destructive">Delete</div>
    </Elevated>
  );
}

export default function ElevatedDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <div className="flex flex-col items-center gap-3">
        <SurfaceProvider value={1}>
          <div
            className={cn(
              "flex items-center justify-center rounded-3xl p-3.5",
              surfaceClasses(1),
            )}
          >
            <Ladder steps={7} />
          </div>
        </SurfaceProvider>
        <p className="text-xs text-muted-foreground">
          Eight levels, each one step above its substrate.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <SurfaceProvider value={1}>
          <div className={cn("space-y-3 rounded-2xl p-3", surfaceClasses(1))}>
            <p className="text-xs font-medium text-foreground">On the page</p>
            <FakePopover label="Menu" />

            <Elevated offset={4} className="space-y-3 rounded-2xl p-3">
              <p className="text-xs font-medium text-foreground">
                Inside a dialog
              </p>
              <FakePopover label="Menu" />
            </Elevated>
          </div>
        </SurfaceProvider>
        <p className="text-xs text-muted-foreground">
          The same popover stays visible three layers down.
        </p>
      </div>
    </div>
  );
}
