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

      success: "border-transparent bg-green-500 text-white hover:bg-green-600",

      warning:
        "border-transparent bg-yellow-500 text-black hover:bg-yellow-600",

      info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",

      purple: "border-transparent bg-purple-500 text-white hover:bg-purple-600",

      pink: "border-transparent bg-pink-500 text-white hover:bg-pink-600",

      soft: "border-transparent bg-muted text-muted-foreground",

      outlineSuccess: "border-green-500 text-green-600 bg-transparent",

      outlineWarning: "border-yellow-500 text-yellow-600 bg-transparent",

      outlineInfo: "border-blue-500 text-blue-600 bg-transparent",

      dotted:
        "border border-dashed border-border bg-transparent text-foreground",

      dottedSuccess:
        "border border-dashed border-green-500 text-green-600 bg-transparent",

      dottedWarning:
        "border border-dashed border-yellow-500 text-yellow-600 bg-transparent",

      dottedInfo:
        "border border-dashed border-blue-500 text-blue-600 bg-transparent",
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
