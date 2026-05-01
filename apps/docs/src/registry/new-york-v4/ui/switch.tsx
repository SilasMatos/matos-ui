"use client";

import { motion, useReducedMotion } from "framer-motion";
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
      "group relative inline-flex shrink-0 cursor-pointer items-center overflow-visible border transition-all duration-300 active:scale-[0.98]",
      "before:absolute before:-inset-2 before:content-['']",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    ],
    rail: [
      "pointer-events-none absolute inset-0 overflow-hidden [border-radius:inherit]",
      "before:absolute before:inset-px before:bg-background/45 before:opacity-0 before:transition-opacity before:duration-300 before:[border-radius:inherit]",
      "group-data-[state=checked]:before:opacity-100",
    ],
    glow: [
      "pointer-events-none absolute inset-0 opacity-0 blur-md transition-opacity duration-300 [border-radius:inherit]",
      "bg-primary/35 group-data-[state=checked]:opacity-70",
    ],
    thumb: [
      "pointer-events-none absolute top-1/2 left-0.5 z-10 flex -translate-y-1/2 items-center justify-center overflow-hidden",
      "bg-background text-muted-foreground shadow-sm ring-1 ring-border transition-[background-color,color,box-shadow] duration-300 will-change-transform",
      "group-data-[state=checked]:bg-primary-foreground group-data-[state=checked]:text-primary group-data-[state=checked]:shadow-md group-data-[state=checked]:ring-primary/20",
    ],
    thumbCore: [
      "absolute inset-1 bg-muted/80 opacity-100 transition-opacity duration-300 [border-radius:inherit]",
      "group-data-[state=checked]:opacity-0",
    ],
    thumbShine: [
      "absolute inset-x-1 top-0.5 h-1/3 rounded-full bg-foreground/10 opacity-70",
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
        root: "border-border/60 bg-muted shadow-inner data-[state=checked]:border-primary/30 data-[state=checked]:bg-primary",
      },
      outline: {
        root: "border-border bg-background shadow-xs data-[state=checked]:border-primary/45 data-[state=checked]:bg-primary/12 dark:data-[state=checked]:bg-primary/20",
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
  const shouldReduceMotion = useReducedMotion();
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
      <span className={styles.glow()} />
      <span className={styles.rail()} />

      {content === "label" ? (
        <>
          <span className="pointer-events-none absolute top-1/2 left-1.5 z-10 -translate-y-1/2 text-[9px] font-medium text-muted-foreground transition-opacity duration-300 group-data-[state=checked]:opacity-30">
            Off
          </span>
          <span className="pointer-events-none absolute top-1/2 right-1.5 z-10 -translate-y-1/2 text-[9px] font-medium text-muted-foreground transition-[opacity,color] duration-300 group-data-[state=checked]:text-primary-foreground group-data-[state=unchecked]:opacity-30">
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
        <span className={styles.thumbCore()} />
        <span className={styles.thumbShine()} />
        {content === "default" ? (
          <motion.span
            className="relative z-10 size-1.5 rounded-full bg-muted-foreground group-data-[state=checked]:bg-primary"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: checked ? 1 : 0.55,
                    scale: checked ? [0.75, 1.25, 1] : 0.75,
                  }
            }
            transition={{ duration: 0.26, ease: "easeOut" }}
          />
        ) : null}
        {content === "icon" ? (
          <span
            data-slot="switch-icon-wrap"
            className="relative z-10 flex size-full shrink-0 items-center justify-center"
          >
            <Check
              data-slot="switch-icon"
              className={twMerge(
                "absolute inset-0 m-auto size-3 text-primary transition-[opacity,scale] duration-200",
                checked ? "scale-100 opacity-100" : "scale-75 opacity-0",
              )}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <X
              data-slot="switch-icon"
              className={twMerge(
                "absolute inset-0 m-auto size-3 text-muted-foreground transition-[opacity,scale] duration-200",
                checked ? "scale-75 opacity-0" : "scale-100 opacity-100",
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
