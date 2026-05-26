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
    "not-prose group/checkbox inline-flex size-4.5 shrink-0 items-center justify-center rounded-[0.35rem] border border-border bg-background text-foreground shadow-xs",
    "transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out hover:border-ring/60 hover:bg-muted/40 active:scale-[0.96]",
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
        className="flex items-center justify-center transition-[opacity,transform] duration-150 data-starting-style:scale-75 data-starting-style:opacity-0 data-ending-style:scale-75 data-ending-style:opacity-0"
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
      <div className="flex items-start gap-2.5">
        <Checkbox
          id={checkboxId}
          invalid={hasError}
          required={required}
          disabled={disabled}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(" ") || undefined
          }
          {...props}
        />
        <div className="grid min-w-0 gap-1">
          <FieldLabel
            htmlFor={checkboxId}
            required={required}
            className="pt-0.5 text-sm"
          >
            {label}
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
