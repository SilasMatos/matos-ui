"use client";

import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export const actionBarVariants = tv({
  base: [
    "fixed z-50 flex w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-3 border sm:w-auto sm:max-w-[calc(100vw-3rem)] sm:flex-row sm:items-center",
    "supports-[backdrop-filter]:backdrop-blur-sm",
  ],
  variants: {
    placement: {
      bottomCenter:
        "bottom-4 right-4 left-4 translate-x-0 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2",
      bottomRight:
        "right-4 bottom-4 left-4 translate-x-0 sm:right-6 sm:bottom-6 sm:left-auto",
      bottomLeft:
        "bottom-4 right-4 left-4 translate-x-0 sm:bottom-6 sm:right-auto sm:left-6",
    },
    tone: {
      default: "border-border",
      destructive: "border-destructive/45",
      success: "border-primary/35",
      warning: "border-ring/50",
      info: "border-primary/30",
    },
    size: {
      sm: "rounded-lg px-3 py-2",
      md: "rounded-xl px-4 py-3",
    },
  },
  defaultVariants: {
    placement: "bottomCenter",
    tone: "default",
    size: "md",
  },
});

export interface ActionBarActions {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type ActionBarPropsBase = ComponentProps<"div"> &
  VariantProps<typeof actionBarVariants> & {
    subject?: string;
    title?: string;
    description?: string;
    icon?: ReactNode;
    ariaLabel?: string;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmLabelLoading?: string;
  };

type ActionBarPropsWithActions = ActionBarPropsBase & {
  actions: ActionBarActions;
  onConfirm?: never;
  onCancel?: never;
  isLoading?: never;
};

type ActionBarPropsLegacy = ActionBarPropsBase & {
  actions?: undefined;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export type ActionBarProps = ActionBarPropsWithActions | ActionBarPropsLegacy;

export function ActionBar(props: ActionBarProps) {
  const {
    subject,
    title,
    description,
    icon,

    ariaLabel = "Confirm action",
    cancelLabel = "Cancel",
    confirmLabel = "Confirm",
    confirmLabelLoading = "Processing...",
    className,
    placement,
    tone,
    size,
    ...rest
  } = props;

  const actions: ActionBarActions =
    "actions" in props && props.actions
      ? props.actions
      : {
          onConfirm: props.onConfirm,
          onCancel: props.onCancel,
          isLoading: props.isLoading,
        };

  const isLoading = actions.isLoading ?? false;

  return (
    <>
      {/* Backdrop blur layer */}
      <div className="" aria-hidden />

      <Elevated
        data-slot="action-bar"
        offset={3}
        role="dialog"
        aria-label={ariaLabel}
        data-loading={isLoading ? "" : undefined}
        className={twMerge(
          actionBarVariants({ placement, tone, size }),
          className,
        )}
        {...rest}
      >
        <div className="flex min-w-0 items-start gap-2 text-sm font-medium text-foreground sm:items-center">
          {icon}

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="break-words">
              {title ??
                (subject
                  ? `Confirm action for "${subject}"?`
                  : "Are you sure you want to continue?")}
            </span>

            {description && (
              <span className="mt-0.5 break-words text-muted-foreground text-xs">
                {description}
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-0 flex-1 sm:flex-none"
            onClick={actions.onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            size="sm"
            className="min-w-0 flex-1 sm:flex-none"
            onClick={actions.onConfirm}
            disabled={isLoading}
          >
            {isLoading ? confirmLabelLoading : confirmLabel}
          </Button>
        </div>
      </Elevated>
    </>
  );
}
