"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
} from "@/registry/new-york-v4/ui/field";

export const checkboxVariants = cva(
  [
    "not-prose group/checkbox inline-flex size-4.5 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground shadow-xs",
    "transition-[background-color,border-color,box-shadow,transform] hover:border-ring/60 hover:bg-muted/40 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "data-checked:border-ring data-checked:bg-muted data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive/10 data-[invalid=true]:focus-visible:ring-destructive/20",
    "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-4.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type CheckboxProps = CheckboxPrimitive.Root.Props &
  VariantProps<typeof checkboxVariants> & {
    invalid?: boolean;
  };

export function Checkbox({
  className,
  size = "md",
  invalid = false,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-invalid={invalid || undefined}
      className={cn(checkboxVariants({ size, className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center transition-[opacity,transform] data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0"
      >
        <Check className="size-3" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export type CheckboxFieldProps = Omit<CheckboxProps, "id"> & {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  reserveMessageSpace?: boolean;
};

export function CheckboxField({
  id,
  className: checkboxClassName,
  label,
  description,
  error,
  reserveMessageSpace = true,
  invalid = false,
  required,
  disabled,
  ...props
}: CheckboxFieldProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const hasError = Boolean(error) || invalid;
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;

  return (
    <Field
      data-slot="checkbox-field"
      invalid={hasError}
      disabled={disabled}
      className="gap-1"
    >
      <div className="flex items-start gap-2">
        <Checkbox
          id={checkboxId}
          className={cn("peer/checkbox", checkboxClassName)}
          invalid={hasError}
          required={required}
          disabled={disabled}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(" ") || undefined
          }
          {...props}
        />
        <div className="grid min-w-0 gap-1 peer-data-checked/checkbox:[&_[data-slot=checkbox-strike-primary]]:[stroke-dashoffset:0] peer-data-checked/checkbox:[&_[data-slot=checkbox-strike-secondary]]:[stroke-dashoffset:0]">
          <FieldLabel
            htmlFor={checkboxId}
            required={required}
            className="text-sm leading-[1.125rem]"
          >
            <span className="relative">
              {label}
              <svg
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-[-0.1875rem] top-1/2 h-3 w-[calc(100%+0.375rem)] -translate-y-1/2 overflow-visible"
                aria-hidden="true"
              >
                <path
                  data-slot="checkbox-strike-primary"
                  d="M 0 5.8 C 13 4.1, 25 7.2, 39 5.5 S 66 4.3, 79 5.9 S 94 6.6, 100 5.1"
                  pathLength="100"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="text-foreground/70 transition-[stroke-dashoffset] duration-slow ease-spring motion-reduce:duration-0"
                />
                <path
                  data-slot="checkbox-strike-secondary"
                  d="M 0.5 7.8 C 14 6.7, 28 8.9, 43 7.2 S 70 6.4, 82 7.7 S 95 8.1, 99.5 7"
                  pathLength="100"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="text-foreground/35 transition-[stroke-dashoffset] delay-75 duration-slow ease-spring motion-reduce:delay-0 motion-reduce:duration-0"
                />
              </svg>
            </span>
          </FieldLabel>
          {description ? (
            <FieldDescription id={descriptionId}>
              {description}
            </FieldDescription>
          ) : null}
        </div>
      </div>
      <FieldMessage
        id={errorId}
        error={error}
        reserveSpace={reserveMessageSpace}
        className="pl-7"
      />
    </Field>
  );
}
