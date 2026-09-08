"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";

type PreviewView = "preview" | "code";

export function ComponentPreviewTabs({
  className,
  previewClassName,
  align = "center",
  hideCode = false,
  chromeless = false,
  component,
  source,
  ...props
}: React.ComponentProps<"div"> & {
  previewClassName?: string;
  align?: "center" | "start" | "end";
  hideCode?: boolean;
  /** Height follows the content (no `h-72`), scrolling if it overflows the viewport. */
  chromeless?: boolean;
  component: React.ReactNode;
  source: React.ReactNode;
}) {
  const [view, setView] = React.useState<PreviewView>("preview");
  const showCode = !hideCode && view === "code";

  return (
    <div
      data-slot="component-preview"
      data-chromeless-preview={chromeless ? "true" : undefined}
      className={cn(
        "group relative mt-4 mb-12 flex min-w-0 flex-col gap-3",
        className,
      )}
      {...props}
    >
      {!hideCode && <ViewSwitcher value={view} onValueChange={setView} />}

      {/* The preview stays mounted while the code is shown: unmounting it would
          replay every demo's entrance animation on each tab switch. */}
      <PreviewWrapper
        align={align}
        previewClassName={previewClassName}
        chromeless={chromeless}
        hidden={showCode}
      >
        {component}
      </PreviewWrapper>

      {showCode && (
        <div data-slot="code" className="relative min-w-0">
          {source}
        </div>
      )}
    </div>
  );
}

const VIEWS: { id: PreviewView; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
];

function ViewSwitcher({
  value,
  onValueChange,
}: {
  value: PreviewView;
  onValueChange: (value: PreviewView) => void;
}) {
  return (
    // Sem trilho: as abas repousam no próprio fundo da página e só a ativa sobe
    // um degrau da escada (surface-1), em vez de empilhar caixa dentro de caixa.
    <div role="tablist" className="inline-flex w-fit items-center gap-1">
      {VIEWS.map((item) => {
        const isActive = value === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-active={isActive || undefined}
            onClick={() => {
              onValueChange(item.id);
            }}
            className={cn(
              "rounded-full px-3 py-1 font-medium text-muted-foreground text-xs transition-colors",
              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "data-active:bg-surface-1 data-active:text-foreground data-active:shadow-surface-1",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function PreviewWrapper({
  align,
  previewClassName,
  chromeless,
  hidden,
  children,
}: {
  align: "center" | "start" | "end";
  previewClassName?: string;
  chromeless?: boolean;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div data-slot="preview" className="min-w-0" hidden={hidden}>
      <div
        data-align={align}
        data-chromeless={chromeless ? "true" : undefined}
        // The canvas is the demo's floor: it pins level 1 rather than using
        // `Elevated` (which would stack on the substrate) so it doesn't climb
        // with the page. No border by choice — the 1px ring on `shadow-surface-1`
        // already draws the edge, and `border-border` over `bg-surface-N` would
        // read as an outlined box rather than a surface.
        className={cn(
          // `not-prose` so DocsBody's `.prose` typography (margins on p/ul/table,
          // list markers, table layout) never leaks into a demo — the canvas is
          // the one place every registry component renders, and not all of them
          // carry their own guard.
          "not-prose preview relative flex w-full justify-center overflow-hidden rounded-xl p-4 sm:p-10",
          surfaceClasses(1),
          "data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start",
          chromeless
            ? "h-auto max-h-[min(85vh,920px)] min-h-0 overflow-x-auto overflow-y-auto py-6 sm:py-8"
            : "h-72 overflow-x-auto overflow-y-hidden",
          previewClassName,
        )}
      >
        <SurfaceProvider value={1}>{children}</SurfaceProvider>
      </div>
    </div>
  );
}
