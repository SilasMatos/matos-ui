import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const dividerVariants = tv({
  base: "shrink-0 border-border",

  variants: {
    orientation: {
      horizontal: "w-full border-t",
      vertical: "h-full border-l",
    },

    variant: {
      solid: "",
      dashed: "border-dashed",
      dotted: "border-dotted",
    },

    color: {
      default: "border-border",
    },

    size: {
      sm: "border",
      md: "border-2",
      lg: "border-[3px]",
    },
  },

  defaultVariants: {
    orientation: "horizontal",
    variant: "solid",
    color: "default",
    size: "sm",
  },
});

export type DividerProps = ComponentProps<"div"> &
  VariantProps<typeof dividerVariants>;

export function Divider({
  className,
  orientation = "horizontal",
  variant,
  color,
  size,
  ...props
}: DividerProps) {
  const classes = twMerge(
    dividerVariants({ orientation, variant, color, size }),
    className,
  );

  if (orientation === "vertical") {
    return (
      <div
        data-slot="divider"
        data-orientation="vertical"
        className={classes}
        aria-hidden
        {...props}
      />
    );
  }

  return (
    <hr
      data-slot="divider"
      data-orientation="horizontal"
      className={classes}
      aria-hidden
      {...(props as ComponentProps<"hr">)}
    />
  );
}
