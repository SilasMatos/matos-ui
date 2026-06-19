"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import {
  type ClipboardEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  Field,
  FieldLabel,
  FieldMessage,
} from "@/registry/new-york-v4/ui/field";

export const otpInputVariants = tv({
  slots: {
    root: "not-prose",
    group: "flex items-center",
    cell: [
      "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-xs select-none",
      "transition-[border-color,box-shadow,background-color,transform,color] duration-200 ease-out",
      "data-[filled=true]:border-foreground/25 data-[filled=true]:bg-muted/40",
      "data-[active=true]:-translate-y-0.5 data-[active=true]:border-ring data-[active=true]:bg-background data-[active=true]:shadow-md data-[active=true]:ring-2 data-[active=true]:ring-ring/30",
      "data-[complete=true]:border-chart-2/55 data-[complete=true]:text-foreground",
      "data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/25 data-[invalid=true]:data-[active=true]:border-destructive",
      "data-[disabled=true]:opacity-50",
      "motion-reduce:transform-none motion-reduce:transition-none",
    ],
    input:
      "absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-center font-semibold text-transparent caret-transparent outline-none disabled:cursor-not-allowed",
    char: "pointer-events-none font-semibold tabular-nums leading-none",
    caret:
      "pointer-events-none absolute top-1/2 left-1/2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground",
    separator: "shrink-0 rounded-full bg-border",
    glow: "pointer-events-none absolute -inset-px rounded-xl border border-chart-2/60",
  },
  variants: {
    size: {
      sm: {
        group: "gap-1.5",
        cell: "size-9 text-sm",
        char: "text-sm",
        caret: "h-4",
        separator: "mx-1 h-px w-2.5",
      },
      md: {
        group: "gap-2",
        cell: "size-11 text-base",
        char: "text-base",
        caret: "h-5",
        separator: "mx-1.5 h-px w-3",
      },
      lg: {
        group: "gap-2.5",
        cell: "size-14 text-lg",
        char: "text-lg",
        caret: "h-6",
        separator: "mx-2 h-px w-3.5",
      },
    },
    variant: {
      default: {},
      subtle: {
        cell: "border-transparent bg-muted shadow-none data-[active=true]:border-ring data-[filled=true]:bg-muted",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type OtpInputType = "numeric" | "alphanumeric" | "text";

export type OtpInputProps = Omit<
  ComponentProps<"input">,
  | "value"
  | "defaultValue"
  | "onChange"
  | "size"
  | "type"
  | "pattern"
  | "maxLength"
> &
  VariantProps<typeof otpInputVariants> & {
    length?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    type?: OtpInputType;
    mask?: boolean;
    groupSize?: number;
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    invalid?: boolean;
    containerClassName?: string;
  };

const matchers: Record<OtpInputType, RegExp> = {
  numeric: /[0-9]/,
  alphanumeric: /[a-zA-Z0-9]/,
  text: /[\S]/,
};

const charEase = [0.22, 1, 0.36, 1] as const;

export function OtpInput({
  id,
  className,
  containerClassName,
  size = "md",
  variant = "default",
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  type = "numeric",
  mask = false,
  groupSize,
  label,
  description,
  error,
  invalid,
  required,
  disabled,
  autoComplete = "one-time-code",
  inputMode,
  onFocus,
  onBlur,
  onKeyDown,
  onPaste,
  "aria-describedby": ariaDescribedBy,
  ...props
}: OtpInputProps) {
  const generatedId = useId();
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimationControls();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    sanitize(defaultValue, type, length),
  );
  const [focused, setFocused] = useState(false);
  const completedRef = useRef(false);

  const inputId = id ?? generatedId;
  const currentValue = sanitize(
    isControlled ? (value ?? "") : internalValue,
    type,
    length,
  );
  const chars = currentValue.split("");
  const isComplete = currentValue.length === length;
  const isInvalid = Boolean(error) || invalid === true;
  const caretIndex = isComplete ? length - 1 : currentValue.length;
  const styles = otpInputVariants({ size, variant });

  const messageId = description || error ? `${inputId}-message` : undefined;
  const describedBy =
    [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;
  const resolvedInputMode =
    inputMode ?? (type === "numeric" ? "numeric" : "text");

  const commit = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(currentValue);
    } else if (!isComplete) {
      completedRef.current = false;
    }
  }, [isComplete, currentValue, onComplete]);

  useEffect(() => {
    if (isInvalid && !shouldReduceMotion) {
      controls.start({
        x: [0, -7, 6, -4, 3, 0],
        transition: { duration: 0.42, ease: "easeInOut" },
      });
    }
  }, [isInvalid, shouldReduceMotion, controls]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    commit(sanitize(event.target.value, type, length));
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    const input = event.currentTarget;
    requestAnimationFrame(() => {
      const end = input.value.length;
      input.setSelectionRange(end, end);
    });
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onBlur?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const input = event.currentTarget;
      const end = input.value.length;
      requestAnimationFrame(() => input.setSelectionRange(end, end));
    }
    onKeyDown?.(event);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    commit(sanitize(pasted, type, length));
    onPaste?.(event);
  }

  const renderCells = () => {
    const cells: ReactNode[] = [];

    for (let index = 0; index < length; index += 1) {
      const char = chars[index] ?? "";
      const filled = index < currentValue.length;
      const active = focused && !disabled && index === caretIndex;
      const showCaret = active && !filled;

      cells.push(
        <motion.div
          key={`cell-${index}`}
          data-slot="otp-input-cell"
          data-active={active || undefined}
          data-filled={filled || undefined}
          data-complete={isComplete || undefined}
          data-invalid={isInvalid || undefined}
          data-disabled={disabled || undefined}
          className={styles.cell()}
          initial={
            shouldReduceMotion ? false : { opacity: 0, y: 6, scale: 0.94 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.32,
            delay: shouldReduceMotion ? 0 : index * 0.04,
            ease: charEase,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {char ? (
              <motion.span
                key={`${index}-${char}`}
                className={styles.char()}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 5, scale: 0.55, filter: "blur(2px)" }
                }
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -5, scale: 0.55, filter: "blur(2px)" }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 480, damping: 26, mass: 0.7 }
                }
              >
                {mask ? "•" : char}
              </motion.span>
            ) : null}
          </AnimatePresence>

          {showCaret ? (
            <motion.span
              aria-hidden="true"
              className={styles.caret()}
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 1,
                      ease: "linear",
                      times: [0, 0.5, 0.5, 1],
                      repeat: Number.POSITIVE_INFINITY,
                    }
              }
            />
          ) : null}
        </motion.div>,
      );

      const needsSeparator =
        groupSize && groupSize > 0 && (index + 1) % groupSize === 0;
      if (needsSeparator && index < length - 1) {
        cells.push(
          <span
            key={`separator-${index}`}
            aria-hidden="true"
            className={styles.separator()}
          />,
        );
      }
    }

    return cells;
  };

  return (
    <Field
      data-slot="otp-input"
      className={twMerge(styles.root(), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {label ? (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      ) : null}

      <motion.div
        data-slot="otp-input-group"
        animate={controls}
        className={twMerge("relative w-fit", containerClassName)}
      >
        <fieldset
          aria-label="One-time password"
          className={twMerge("m-0 min-w-0 border-0 p-0", styles.group())}
        >
          {renderCells()}
        </fieldset>

        <AnimatePresence>
          {isComplete && !isInvalid ? (
            <motion.span
              key="otp-complete-glow"
              aria-hidden="true"
              className={styles.glow()}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0.65, scale: 0.99 }
              }
              animate={{ opacity: 0, scale: 1.025 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.55,
                ease: charEase,
              }}
            />
          ) : null}
        </AnimatePresence>

        <input
          ref={inputRef}
          id={inputId}
          data-slot="otp-input-control"
          className={styles.input()}
          value={currentValue}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          inputMode={resolvedInputMode}
          aria-label={label ? undefined : "One-time password"}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          {...props}
        />
      </motion.div>

      {description || error ? (
        <FieldMessage
          id={messageId}
          description={description}
          error={error}
          reserveSpace={false}
        />
      ) : null}
    </Field>
  );
}

function sanitize(raw: string, type: OtpInputType, length: number) {
  const matcher = matchers[type];
  let result = "";
  for (const char of raw) {
    if (matcher.test(char)) {
      result += char;
    }
    if (result.length >= length) {
      break;
    }
  }
  return result;
}
