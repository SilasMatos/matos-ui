"use client";

import { motion } from "framer-motion";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const bouncyToggleVariants = tv({
  base: [
    "relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-1 outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  variants: {
    size: {
      sm: "h-6 w-11",
      md: "h-7 w-[52px]",
      lg: "h-8 w-[60px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const knobSize: Record<string, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export type BouncyToggleProps = Omit<
  ComponentProps<"button">,
  "onChange" | "value"
> &
  VariantProps<typeof bouncyToggleVariants> & {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    stiffness?: number;
    damping?: number;
  };

export function BouncyToggle({
  className,
  size = "md",
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  stiffness = 500,
  damping = 15,
  ...props
}: BouncyToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked ?? internal;

  const toggle = useCallback(() => {
    const next = !isOn;
    if (checked === undefined) {
      setInternal(next);
    }
    onCheckedChange?.(next);
  }, [checked, isOn, onCheckedChange]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={toggle}
      data-slot="bouncy-toggle"
      data-state={isOn ? "checked" : "unchecked"}
      className={twMerge(
        bouncyToggleVariants({ size }),
        isOn ? "bg-primary" : "bg-muted",
        className,
      )}
      {...props}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness, damping, mass: 0.6 }}
        className={twMerge(
          "rounded-full bg-background shadow-sm",
          knobSize[size ?? "md"],
        )}
        style={{ marginLeft: isOn ? "auto" : 0 }}
        whileTap={{ scaleX: 1.25 }}
      />
    </button>
  );
}
