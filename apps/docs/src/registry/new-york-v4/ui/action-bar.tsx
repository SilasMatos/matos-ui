"use client";

import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import { Button } from "@/registry/new-york-v4/ui/button";

export const actionBarVariants = tv({
  base: [
    "fixed z-50 flex items-center gap-3 border shadow-lg",
    "backdrop-blur-sm supports-[backdrop-filter]:bg-background/20",
  ],
  variants: {
    placement: {
      bottomCenter: "bottom-6 left-1/2 -translate-x-1/2",
      bottomRight: "bottom-6 right-6 left-auto translate-x-0",
      bottomLeft: "bottom-6 left-6 right-auto translate-x-0",
    },
    tone: {
      default: "border-border bg-surface-raised",
      destructive: "border-destructive/50 bg-destructive/10",
      success: "border-green-500/30 bg-green-500/10",
      warning: "border-yellow-500/30 bg-yellow-500/10",
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

      <div
        data-slot="action-bar"
        role="dialog"
        aria-label={ariaLabel}
        data-loading={isLoading ? "" : undefined}
        className={twMerge(
          actionBarVariants({ placement, tone, size }),
          className,
        )}
        {...rest}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {icon}

          <div className="flex flex-col">
            <span>
              {title ??
                (subject
                  ? `Confirm action for "${subject}"?`
                  : "Are you sure you want to continue?")}
            </span>

            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={actions.onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={actions.onConfirm}
            disabled={isLoading}
          >
            {isLoading ? confirmLabelLoading : confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
