"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, LoaderCircle } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";
import { duration, spring } from "@/registry/new-york-v4/lib/motion-tokens";
import {
  Field,
  FieldLabel,
  FieldMessage,
} from "@/registry/new-york-v4/ui/field";

export const inputVariants = cva(
  [
    "not-prose h-9 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-xs",
    "placeholder:text-muted-foreground file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "transition-[background-color,border-color,box-shadow,transform]",
    "hover:border-border/80 focus-visible:-translate-y-px focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
    "aria-invalid:border-destructive aria-invalid:bg-destructive/10 aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/20",
    "data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive/10 data-[invalid=true]:focus-visible:border-destructive data-[invalid=true]:focus-visible:ring-destructive/20",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        inset: "bg-background",
        muted: "bg-muted/40 shadow-none focus-visible:bg-background",
        ghost:
          "border-transparent bg-transparent shadow-none hover:bg-muted/40",
      },
      inputSize: {
        sm: "h-8 rounded-lg px-2.5 text-xs",
        md: "h-9 px-3",
        lg: "h-10 px-3.5",
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
      inputSize: "md",
      state: "default",
    },
  },
);

export type InputProps = ComponentProps<"input"> &
  VariantProps<typeof inputVariants> & {
    state?: "default" | "error" | "success" | "loading";
    "data-invalid"?: boolean | "true" | "false";
  };

export function Input({
  className,
  variant = "inset",
  inputSize = "md",
  state = "default",
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
  ...props
}: InputProps) {
  const invalid =
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    Boolean(dataInvalid) ||
    state === "error";

  return (
    <InputPrimitive
      data-slot="input"
      data-invalid={dataInvalid ?? (invalid || undefined)}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      className={cn(inputVariants({ variant, inputSize, state, className }))}
      {...props}
    />
  );
}

export type InputFieldProps = Omit<InputProps, "state"> & {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  state?: "default" | "error" | "success" | "loading";
  trailing?: ReactNode;
  reserveMessageSpace?: boolean;
};

export function InputField({
  id,
  className,
  label,
  description,
  error,
  success,
  state = "default",
  trailing,
  reserveMessageSpace = true,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const shouldReduceMotion = useReducedMotion();
  const inputId = id ?? generatedId;
  const invalid =
    Boolean(error) ||
    state === "error" ||
    ariaInvalid === true ||
    ariaInvalid === "true";
  const resolvedState = invalid ? "error" : state;
  const messageId =
    description || error || success ? `${inputId}-message` : undefined;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(" ");
  const showStatusIcon =
    trailing ?? (resolvedState === "loading" || resolvedState === "success");

  return (
    <Field data-slot="input-field" invalid={invalid} disabled={disabled}>
      {label ? (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <div className="relative">
        <Input
          id={inputId}
          className={cn(showStatusIcon && "pr-9", className)}
          state={resolvedState}
          required={required}
          disabled={disabled}
          aria-describedby={describedBy || undefined}
          aria-invalid={invalid || undefined}
          {...props}
        />
        <AnimatePresence initial={false}>
          {showStatusIcon ? (
            <motion.span
              key={resolvedState}
              data-slot="input-status"
              aria-hidden="true"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={
                shouldReduceMotion ? { duration: duration.fast } : spring.fast
              }
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground"
            >
              {trailing ??
                (resolvedState === "loading" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4 text-foreground" />
                ))}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
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
