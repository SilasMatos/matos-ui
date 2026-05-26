import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const formGridVariants = tv({
  base: "grid w-full grid-cols-1",
  variants: {
    columns: {
      one: "",
      two: "md:grid-cols-2",
      three: "md:grid-cols-2 lg:grid-cols-3",
    },
    gap: {
      compact: "gap-3",
      default: "gap-4",
      comfortable: "gap-5",
    },
  },
  defaultVariants: {
    columns: "two",
    gap: "default",
  },
});

export type FormGridProps = ComponentProps<"div"> &
  VariantProps<typeof formGridVariants>;

export function FormGrid({
  className,
  columns = "two",
  gap = "default",
  ...props
}: FormGridProps) {
  return (
    <div
      data-slot="form-grid"
      className={twMerge(formGridVariants({ columns, gap }), className)}
      {...props}
    />
  );
}

export type FormGridItemProps = ComponentProps<"div"> & {
  span?: "one" | "two" | "full";
};

export function FormGridItem({
  className,
  span = "one",
  ...props
}: FormGridItemProps) {
  return (
    <div
      data-slot="form-grid-item"
      data-span={span}
      className={twMerge(
        "min-w-0 data-[span=two]:md:col-span-2 data-[span=full]:col-span-full",
        className,
      )}
      {...props}
    />
  );
}
