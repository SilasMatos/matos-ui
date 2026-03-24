"use client";

import { Check, X } from "lucide-react";
import { type ComponentProps, useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const labelTrackWidth: Record<"sm" | "md" | "lg", string> = {
  sm: "w-16 min-w-16",
  md: "w-[4.5rem] min-w-[4.5rem]",
  lg: "w-20 min-w-20",
};

const labelThumbTranslate: Record<"sm" | "md" | "lg", string> = {
  sm: "group-data-[state=checked]:translate-x-11",
  md: "group-data-[state=checked]:translate-x-12",
  lg: "group-data-[state=checked]:translate-x-[3.25rem]",
};

export const switchVariants = tv({
  slots: {
    root: [
      "group relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden border-2 border-transparent transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    ],
    thumb: [
      "pointer-events-none absolute top-1/2 left-0.5 z-10 flex -translate-y-1/2 items-center justify-center overflow-hidden rounded-full",
      "bg-foreground shadow-sm transition-[transform,background-color] duration-200 ease-out will-change-transform",
      "group-data-[state=checked]:bg-primary-foreground",
    ],
  },
  variants: {
    size: {
      sm: {
        root: "h-5 min-h-5 w-9 min-w-9 p-0.5",
        thumb: "size-4 group-data-[state=checked]:translate-x-4",
      },
      md: {
        root: "h-6 min-h-6 w-11 min-w-11 p-0.5",
        thumb: "size-5 group-data-[state=checked]:translate-x-5",
      },
      lg: {
        root: "h-7 min-h-7 w-14 min-w-14 p-0.5",
        thumb: "size-6 group-data-[state=checked]:translate-x-7",
      },
    },
    variant: {
      filled: {
        root: "border-transparent bg-input data-[state=checked]:border-transparent data-[state=checked]:bg-primary",
      },
      outline: {
        root: "border-border bg-transparent dark:border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 dark:data-[state=checked]:bg-primary/15",
      },
    },
    shape: {
      pill: {
        root: "rounded-full",
        thumb: "rounded-full",
      },
      rectangle: {
        root: "rounded-md",
        thumb: "rounded-[4px]",
      },
    },
    content: {
      default: {},
      icon: {},
      label: {},
    },
  },
  defaultVariants: {
    size: "md",
    variant: "filled",
    shape: "pill",
    content: "default",
  },
});

export type SwitchProps = Omit<ComponentProps<"button">, "onClick"> &
  VariantProps<typeof switchVariants> & {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  };

export function Switch({
  className,
  size = "md",
  variant = "filled",
  shape = "pill",
  content = "default",
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  type = "button",
  ...props
}: SwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internal;

  const setChecked = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternal(next);
      }
      onCheckedChange?.(next);
    },
    [isControlled, onCheckedChange],
  );

  const styles = switchVariants({ size, variant, shape, content });

  return (
    <button
      type={type}
      role="switch"
      aria-checked={checked}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setChecked(!checked);
        }
      }}
      className={twMerge(
        styles.root(),
        content === "label" ? labelTrackWidth[size ?? "md"] : undefined,
        className,
      )}
      {...props}
    >
      {content === "label" ? (
        <>
          <span className="pointer-events-none absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] font-medium text-muted-foreground transition-opacity group-data-[state=checked]:opacity-25">
            Off
          </span>
          <span className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-[9px] font-medium text-muted-foreground transition-[opacity,color] group-data-[state=checked]:text-primary-foreground group-data-[state=unchecked]:opacity-25">
            On
          </span>
        </>
      ) : null}

      <span
        className={twMerge(
          styles.thumb(),
          content === "label" ? labelThumbTranslate[size ?? "md"] : undefined,
        )}
      >
        {content === "icon" ? (
          <span
            data-slot="switch-icon-wrap"
            className="relative flex size-full shrink-0 items-center justify-center"
          >
            <Check
              data-slot="switch-icon"
              className={twMerge(
                "absolute inset-0 m-auto size-3 text-primary transition-opacity",
                checked ? "opacity-100" : "opacity-0",
              )}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <X
              data-slot="switch-icon"
              className={twMerge(
                "absolute inset-0 m-auto size-3 text-background transition-opacity",
                checked ? "opacity-0" : "opacity-100",
              )}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </span>
        ) : null}
      </span>
    </button>
  );
}
