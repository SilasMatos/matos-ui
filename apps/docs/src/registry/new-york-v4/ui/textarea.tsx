"use client";

import { type ComponentProps, type ReactNode, useId } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  Field,
  FieldLabel,
  FieldMessage,
} from "@/registry/new-york-v4/ui/field";

export const textareaVariants = tv({
  base: [
    "not-prose min-h-24 w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-xs",
    "placeholder:text-muted-foreground transition-[background-color,border-color,box-shadow,transform] duration-300 ease-in-out",
    "hover:border-border/80 focus-visible:-translate-y-px focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
    "aria-invalid:border-destructive aria-invalid:bg-destructive/10 aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/20",
    "data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive/10 data-[invalid=true]:focus-visible:border-destructive data-[invalid=true]:focus-visible:ring-destructive/20",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60",
  ],
  variants: {
    variant: {
      inset: "bg-background",
      muted: "bg-muted/40 shadow-none focus-visible:bg-background",
      ghost: "border-transparent bg-transparent shadow-none hover:bg-muted/40",
    },
    textareaSize: {
      sm: "min-h-20 rounded-lg px-2.5 py-2 text-xs",
      md: "min-h-24",
      lg: "min-h-32 px-3.5 py-3",
    },
    state: {
      default: "",
      error:
        "border-destructive bg-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/20",
      success: "border-ring/50 focus-visible:border-ring",
      loading: "cursor-wait",
    },
  },
  defaultVariants: {
    variant: "inset",
    textareaSize: "md",
    state: "default",
  },
});

export type TextareaProps = ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants> & {
    state?: "default" | "error" | "success" | "loading";
    "data-invalid"?: boolean | "true" | "false";
  };

export function Textarea({
  className,
  variant = "inset",
  textareaSize = "md",
  state = "default",
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
  ...props
}: TextareaProps) {
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    Boolean(dataInvalid) ||
    state === "error";

  return (
    <textarea
      data-slot="textarea"
      data-invalid={dataInvalid ?? (invalid || undefined)}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      className={twMerge(
        textareaVariants({ variant, textareaSize, state }),
        className,
      )}
      {...props}
    />
  );
}

export type TextareaFieldProps = Omit<TextareaProps, "state"> & {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  state?: "default" | "error" | "success" | "loading";
  reserveMessageSpace?: boolean;
};

export function TextareaField({
  id,
  label,
  description,
  error,
  success,
  state = "default",
  reserveMessageSpace = true,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const invalid =
    Boolean(error) ||
    state === "error" ||
    ariaInvalid === true ||
    ariaInvalid === "true";
  const messageId =
    description || error || success ? `${textareaId}-message` : undefined;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(" ");

  return (
    <Field data-slot="textarea-field" invalid={invalid} disabled={disabled}>
      {label ? (
        <FieldLabel htmlFor={textareaId} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <Textarea
        id={textareaId}
        state={invalid ? "error" : state}
        required={required}
        disabled={disabled}
        aria-describedby={describedBy || undefined}
        aria-invalid={invalid || undefined}
        {...props}
      />
      <FieldMessage
        id={messageId}
        description={description}
        error={error}
        success={success}
        reserveSpace={reserveMessageSpace}
      />
    </Field>
  );
}
