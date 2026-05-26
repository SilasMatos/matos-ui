"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
  useId,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  Field,
  FieldLabel,
  FieldMessage,
} from "@/registry/new-york-v4/ui/field";
import { Input } from "@/registry/new-york-v4/ui/input";

export type PasswordCriterion = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

export const defaultPasswordCriteria: PasswordCriterion[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "One number",
    test: (value) => /\d/.test(value),
  },
  {
    id: "special",
    label: "One special character",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export const passwordInputVariants = tv({
  slots: {
    root: "not-prose gap-2",
    control: "relative",
    toggle: [
      "absolute inset-y-0 right-1.5 my-auto inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground",
      "transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted/60 hover:text-foreground active:scale-[0.97]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    meter:
      "mt-0.5 grid gap-1.5 rounded-xl border border-border bg-muted/40 p-2.5",
    meterHeader:
      "flex items-center justify-between gap-2 text-[11px] text-muted-foreground",
    meterTrack: "h-1 overflow-hidden rounded-full bg-muted",
    meterBar: "h-full rounded-full bg-foreground",
    criteria: "grid gap-1 pt-0.5 sm:grid-cols-2",
    criterion:
      "flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors duration-200 data-[met=true]:text-foreground",
    criterionIcon:
      "flex size-3.5 shrink-0 items-center justify-center rounded-full border border-border bg-background",
  },
  variants: {
    size: {
      sm: { meter: "p-2", criteria: "gap-0.5" },
      md: {},
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type PasswordInputProps = Omit<
  ComponentProps<"input">,
  "type" | "size"
> &
  VariantProps<typeof passwordInputVariants> & {
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    criteria?: readonly PasswordCriterion[];
    showCriteria?: boolean;
    inputClassName?: string;
    strengthLabel?: (completed: number, total: number) => ReactNode;
    reserveMessageSpace?: boolean;
  };

export function PasswordInput({
  id,
  className,
  inputClassName,
  size = "md",
  label,
  description,
  error,
  criteria = defaultPasswordCriteria,
  showCriteria = true,
  strengthLabel,
  reserveMessageSpace = true,
  required,
  disabled,
  value,
  defaultValue,
  onChange,
  autoComplete = "new-password",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [internalValue, setInternalValue] = useState(() =>
    typeof defaultValue === "string" ? defaultValue : "",
  );
  const inputId = id ?? generatedId;
  const password = typeof value === "string" ? value : internalValue;
  const invalid =
    Boolean(error) || ariaInvalid === true || ariaInvalid === "true";
  const results = criteria.map((criterion) => ({
    ...criterion,
    met: criterion.test(password),
  }));
  const completed = results.filter((criterion) => criterion.met).length;
  const isComplete = password.length > 0 && completed === criteria.length;
  const meterWidth =
    password.length > 0
      ? Math.max((completed / Math.max(criteria.length, 1)) * 100, 10)
      : 0;
  const messageId = description || error ? `${inputId}-message` : undefined;
  const criteriaId = showCriteria ? `${inputId}-criteria` : undefined;
  const describedBy = [ariaDescribedBy, messageId, criteriaId]
    .filter(Boolean)
    .join(" ");
  const styles = passwordInputVariants({ size });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setInternalValue(event.target.value);
    onChange?.(event);
  }

  return (
    <Field
      data-slot="password-input"
      className={twMerge(styles.root(), className)}
      invalid={invalid}
      disabled={disabled}
    >
      {label ? (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <div data-slot="password-input-control" className={styles.control()}>
        <Input
          id={inputId}
          type={visible ? "text" : "password"}
          inputSize={size}
          className={twMerge("pr-10", inputClassName)}
          state={invalid ? "error" : isComplete ? "success" : "default"}
          value={value}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-describedby={describedBy || undefined}
          aria-invalid={invalid || undefined}
          onChange={handleChange}
          {...props}
        />
        <button
          type="button"
          data-slot="password-input-toggle"
          className={styles.toggle()}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={visible ? "visible" : "hidden"}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.88 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              {visible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <FieldMessage
        id={messageId}
        description={description}
        error={error}
        reserveSpace={reserveMessageSpace}
      />
      {showCriteria ? (
        <div
          id={criteriaId}
          data-slot="password-input-meter"
          className={styles.meter()}
        >
          <div className={styles.meterHeader()}>
            <span>Password strength</span>
            <span>
              {strengthLabel?.(completed, criteria.length) ??
                `${completed}/${criteria.length} met`}
            </span>
          </div>
          <div className={styles.meterTrack()} aria-hidden="true">
            <motion.div
              className={styles.meterBar()}
              initial={false}
              animate={{ width: `${meterWidth}%`, opacity: password ? 1 : 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
          <ul className={styles.criteria()}>
            {results.map((criterion) => (
              <li
                key={criterion.id}
                data-met={criterion.met}
                className={styles.criterion()}
              >
                <span className={styles.criterionIcon()} aria-hidden="true">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.span
                      key={criterion.met ? "valid" : "pending"}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.7 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{
                        duration: 0.16,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {criterion.met ? (
                        <Check className="size-2.5" />
                      ) : (
                        <Circle className="size-2 fill-muted text-muted" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {criterion.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Field>
  );
}
