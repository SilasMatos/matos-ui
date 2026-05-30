"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";

const componentPreviewBackground =
  "url('data:image/svg+xml,%3Csvg width=%2296%22 height=%2296%22 viewBox=%220 0 96 96%22 xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22%3E%3Cg stroke=%22%23A1A1AA%22 stroke-width=%221%22%3E%3Cpath d=%22M-48 96L96 -48%22 stroke-opacity=%220.12%22/%3E%3Cpath d=%22M-24 104L104 -24%22 stroke-opacity=%220.07%22/%3E%3Cpath d=%22M0 112L112 0%22 stroke-opacity=%220.1%22/%3E%3Cpath d=%22M24 120L120 24%22 stroke-opacity=%220.05%22/%3E%3Cpath d=%22M48 128L128 48%22 stroke-opacity=%220.09%22/%3E%3C/g%3E%3C/svg%3E')";

export function ComponentPreviewTabs({
  className,
  previewClassName,
  align = "center",
  hideCode = false,
  chromeless = false,
  component,
  source,
  sourcePreview,
  ...props
}: React.ComponentProps<"div"> & {
  previewClassName?: string;
  align?: "center" | "start" | "end";
  hideCode?: boolean;
  /** Altura segue o conteúdo (sem `h-72`), com scroll se passar do viewport. */
  chromeless?: boolean;
  component: React.ReactNode;
  source: React.ReactNode;
  sourcePreview?: React.ReactNode;
}) {
  const [isMobileCodeVisible, setIsMobileCodeVisible] = React.useState(false);

  return (
    <div
      data-slot="component-preview"
      data-chromeless-preview={chromeless ? "true" : undefined}
      className={cn(
        "group relative mt-4 mb-12 flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border p-3 sm:p-4",
        className,
      )}
      {...props}
    >
      <PreviewWrapper
        align={align}
        previewClassName={previewClassName}
        chromeless={chromeless}
      >
        {component}
      </PreviewWrapper>
      {!hideCode && (
        <div
          data-slot="code"
          data-mobile-code-visible={isMobileCodeVisible}
          className="relative"
        >
          {isMobileCodeVisible ? (
            source
          ) : (
            <div className="relative h-32 overflow-hidden">
              {sourcePreview}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--color-background), color-mix(in oklab, var(--color-background) 60%, transparent), transparent)",
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="pointer-events-auto relative z-10"
                  onClick={() => {
                    setIsMobileCodeVisible(true);
                  }}
                >
                  View Code
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewWrapper({
  align,
  previewClassName,
  chromeless,
  children,
}: {
  align: "center" | "start" | "end";
  previewClassName?: string;
  chromeless?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div data-slot="preview" className="min-w-0">
      <div
        data-align={align}
        data-chromeless={chromeless ? "true" : undefined}
        className={cn(
          "preview relative flex w-full justify-center overflow-hidden rounded-lg border border-border/45 bg-muted/20 p-4 dark:bg-background sm:p-10",
          "data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start",
          chromeless
            ? "h-auto min-h-0 max-h-[min(85vh,920px)] overflow-x-auto overflow-y-auto py-6 sm:py-8"
            : "h-72 overflow-x-auto overflow-y-hidden",
          previewClassName,
        )}
        style={{
          backgroundImage: componentPreviewBackground,
          backgroundRepeat: "repeat",
          backgroundSize: "96px 96px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
