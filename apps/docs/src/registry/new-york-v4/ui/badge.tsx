import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const badgeVariants = tv({
  base: [
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ],

  variants: {
    variant: {
      default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",

      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

      destructive:
        "border-transparent bg-destructive text-white hover:bg-destructive/80",

      outline: "border-border text-foreground bg-transparent",

      ghost: "border-transparent text-foreground bg-transparent hover:bg-muted",

      soft: "border-transparent bg-muted text-muted-foreground",

      dotted:
        "border border-dashed border-border bg-transparent text-foreground",
    },
  },

  defaultVariants: {
    variant: "default",
  },
});

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={twMerge(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
