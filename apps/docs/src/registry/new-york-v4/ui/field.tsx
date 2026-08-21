"use client";

import {
  AnimatePresence,
  type MotionProps,
  motion,
  useReducedMotion,
} from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const fieldVariants = tv({
  slots: {
    root: "not-prose group/field grid w-full gap-1.5 text-foreground",
    label: [
      "flex w-fit items-center gap-1 text-xs font-medium text-foreground",
      "transition-[color,transform] duration-300 ease-spring",
      "group-focus-within/field:-translate-y-px group-focus-within/field:text-foreground",
      "group-data-[invalid=true]/field:text-destructive group-data-[disabled=true]/field:opacity-60",
    ],
    description: "text-xs leading-relaxed text-muted-foreground",
    feedback: "flex items-start gap-1.5 text-xs leading-relaxed",
  },
  variants: {
    density: {
      compact: { root: "gap-1" },
      default: { root: "gap-1.5" },
      comfortable: { root: "gap-2" },
    },
    invalid: {
      true: {},
      false: {},
    },
    disabled: {
      true: { root: "cursor-not-allowed opacity-70" },
      false: {},
    },
  },
  defaultVariants: {
    density: "default",
    invalid: false,
    disabled: false,
  },
});

const feedbackEase = [0.4, 0, 0.2, 1] as const;

export type FieldProps = ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    invalid?: boolean;
    disabled?: boolean;
  };

export function Field({
  className,
  density = "default",
  invalid = false,
  disabled = false,
  ...props
}: FieldProps) {
  const styles = fieldVariants({ density, invalid, disabled });

  return (
    <div
      data-slot="field"
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={twMerge(styles.root(), className)}
      {...props}
    />
  );
}

export type FieldLabelProps = Omit<ComponentProps<"label">, "htmlFor"> & {
  htmlFor: string;
  required?: boolean;
};

export function FieldLabel({
  className,
  htmlFor,
  required = false,
  children,
  ...props
}: FieldLabelProps) {
  const styles = fieldVariants();

  return (
    <label
      data-slot="field-label"
      htmlFor={htmlFor}
      className={twMerge("not-prose", styles.label(), className)}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

export type FieldDescriptionProps = ComponentProps<"p">;

export function FieldDescription({
  className,
  ...props
}: FieldDescriptionProps) {
  const styles = fieldVariants();

  return (
    <p
      data-slot="field-description"
      className={twMerge("not-prose", styles.description(), className)}
      {...props}
    />
  );
}

export type FieldErrorProps = Omit<
  ComponentProps<"p">,
  "children" | keyof MotionProps
> & {
  children?: ReactNode;
  error?: ReactNode;
  showIcon?: boolean;
};

export function FieldError({
  className,
  children,
  error,
  showIcon = true,
  ...props
}: FieldErrorProps) {
  const shouldReduceMotion = useReducedMotion();
  const styles = fieldVariants();
  const message = error ?? children;

  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          data-slot="field-error"
          role="alert"
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -2, filter: "blur(2px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -1, filter: "blur(1px)" }
          }
          transition={{
            duration: shouldReduceMotion ? 0.01 : 0.28,
            ease: feedbackEase,
          }}
          className={twMerge(
            "not-prose",
            styles.feedback(),
            "text-destructive",
            className,
          )}
          {...props}
        >
          {showIcon ? (
            <AlertCircle
              className="mt-px size-3.5 shrink-0"
              aria-hidden="true"
            />
          ) : null}
          <span>{message}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export type FieldSuccessProps = Omit<
  ComponentProps<"p">,
  "children" | keyof MotionProps
> & {
  children?: ReactNode;
  showIcon?: boolean;
};

export function FieldSuccess({
  className,
  children,
  showIcon = true,
  ...props
}: FieldSuccessProps) {
  const shouldReduceMotion = useReducedMotion();
  const styles = fieldVariants();

  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.p
          data-slot="field-success"
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -2, filter: "blur(2px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -1, filter: "blur(1px)" }
          }
          transition={{
            duration: shouldReduceMotion ? 0.01 : 0.28,
            ease: feedbackEase,
          }}
          className={twMerge(
            "not-prose",
            styles.feedback(),
            "text-foreground",
            className,
          )}
          {...props}
        >
          {showIcon ? (
            <CheckCircle2
              className="mt-px size-3.5 shrink-0"
              aria-hidden="true"
            />
          ) : null}
          <span>{children}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export type FieldMessageProps = ComponentProps<"div"> & {
  description?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  reserveSpace?: boolean;
  showIcon?: boolean;
};

export function FieldMessage({
  className,
  description,
  error,
  success,
  reserveSpace = true,
  showIcon = true,
  ...props
}: FieldMessageProps) {
  return (
    <div
      data-slot="field-message"
      className={twMerge(
        "not-prose min-w-0",
        reserveSpace && "min-h-5",
        className,
      )}
      {...props}
    >
      {error ? (
        <FieldError error={error} showIcon={showIcon} />
      ) : success ? (
        <FieldSuccess showIcon={showIcon}>{success}</FieldSuccess>
      ) : description ? (
        <FieldDescription>{description}</FieldDescription>
      ) : null}
    </div>
  );
}

export type InputGroupProps = ComponentProps<"div"> & {
  invalid?: boolean;
  disabled?: boolean;
};

export function InputGroup({
  className,
  invalid = false,
  disabled = false,
  ...props
}: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={twMerge(
        "not-prose flex h-9 w-full items-center overflow-hidden rounded-xl border border-border bg-background shadow-xs",
        "transition-[border-color,box-shadow,transform,background-color] duration-300 ease-spring focus-within:-translate-y-px focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
        "data-[invalid=true]:border-destructive data-[invalid=true]:focus-within:border-destructive data-[invalid=true]:focus-within:ring-destructive/20",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_[data-slot=input]]:h-full [&_[data-slot=input]]:rounded-none [&_[data-slot=input]]:border-0 [&_[data-slot=input]]:shadow-none [&_[data-slot=input]]:focus-visible:translate-y-0 [&_[data-slot=input]]:focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export type InputGroupAddonProps = ComponentProps<"span">;

export function InputGroupAddon({ className, ...props }: InputGroupAddonProps) {
  return (
    <span
      data-slot="input-group-addon"
      className={twMerge(
        "not-prose flex h-full shrink-0 items-center border-border px-2.5 text-xs text-muted-foreground first:border-r last:border-l",
        className,
      )}
      {...props}
    />
  );
}

export type InputGroupButtonProps = ComponentProps<"button">;

export function InputGroupButton({
  className,
  type = "button",
  ...props
}: InputGroupButtonProps) {
  return (
    <button
      type={type}
      data-slot="input-group-button"
      className={twMerge(
        "not-prose inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 ease-spring hover:bg-muted/60 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
