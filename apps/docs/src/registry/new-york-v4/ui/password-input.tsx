"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Circle, Eye, EyeOff } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
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

type IconCircleCheckProps = ComponentProps<"svg"> & {
  size?: string | number;
};

function IconCircleCheck({ size = "14px", ...props }: IconCircleCheckProps) {
  const id = useId().replace(/:/g, "");

  const checkGradientId = `${id}-circle-check-gradient`;
  const blurGradientId = `${id}-circle-blur-gradient`;
  const highlightGradientId = `${id}-circle-highlight-gradient`;
  const filterId = `${id}-circle-check-filter`;
  const clipPathId = `${id}-circle-check-clip-path`;
  const maskId = `${id}-circle-check-mask`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g fill="none" className="nc-icon-wrapper">
        <path
          d="M16.586 7.08579C17.367 6.30474 18.6331 6.30474 19.4141 7.08579C20.1951 7.86684 20.1951 9.13289 19.4141 9.91391L11.9141 17.4139C11.1331 18.1949 9.86705 18.1949 9.086 17.4139L5.086 13.4139C4.30495 12.6329 4.30495 11.3668 5.086 10.5858C5.86705 9.80474 7.13308 9.80474 7.91412 10.5858L10.5001 13.1717L16.586 7.08579Z"
          fill={`url(#${checkGradientId})`}
          data-glass="origin"
          mask={`url(#${maskId})`}
        />

        <path
          d="M16.586 7.08579C17.367 6.30474 18.6331 6.30474 19.4141 7.08579C20.1951 7.86684 20.1951 9.13289 19.4141 9.91391L11.9141 17.4139C11.1331 18.1949 9.86705 18.1949 9.086 17.4139L5.086 13.4139C4.30495 12.6329 4.30495 11.3668 5.086 10.5858C5.86705 9.80474 7.13308 9.80474 7.91412 10.5858L10.5001 13.1717L16.586 7.08579Z"
          fill={`url(#${checkGradientId})`}
          data-glass="clone"
          filter={`url(#${filterId})`}
          clipPath={`url(#${clipPathId})`}
          opacity={0.45}
        />

        <path
          d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM18.707 7.79297C18.3165 7.40245 17.6835 7.40244 17.293 7.79297L10.5 14.5859L7.20703 11.293C6.81651 10.9024 6.18349 10.9024 5.79297 11.293C5.40245 11.6835 5.40245 12.3165 5.79297 12.707L9.79297 16.707C10.1835 17.0976 10.8165 17.0976 11.207 16.707L18.707 9.20703C19.0976 8.81651 19.0976 8.18349 18.707 7.79297Z"
          fill={`url(#${blurGradientId})`}
          data-glass="blur"
          opacity={0.35}
        />

        <path
          d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM12 1.75C6.33908 1.75 1.75 6.33908 1.75 12C1.75 17.6609 6.33908 22.25 12 22.25C17.6609 22.25 22.25 17.6609 22.25 12C22.25 6.33908 17.6609 1.75 12 1.75Z"
          fill={`url(#${highlightGradientId})`}
          opacity={0.65}
        />

        <defs>
          <linearGradient
            id={checkGradientId}
            x1="12.25"
            y1="6.5"
            x2="12.25"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#34D399" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>

          <linearGradient
            id={blurGradientId}
            x1="12"
            y1="1"
            x2="12"
            y2="23"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              stopColor="var(--nc-gradient-2-color-1, #E3E3E5)"
              stopOpacity="0.35"
            />
            <stop
              offset="1"
              stopColor="var(--nc-gradient-2-color-2, #BBBBC0)"
              stopOpacity="0.2"
            />
          </linearGradient>

          <linearGradient
            id={highlightGradientId}
            x1="12"
            y1="1"
            x2="12"
            y2="13.74"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--nc-light, #fff)" stopOpacity="0.75" />
            <stop
              offset="1"
              stopColor="var(--nc-light, #fff)"
              stopOpacity="0"
            />
          </linearGradient>

          <filter
            id={filterId}
            x="-100%"
            y="-100%"
            width="400%"
            height="400%"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
          >
            <feGaussianBlur
              stdDeviation="2"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              in="SourceGraphic"
              edgeMode="none"
              result="blur"
            />
          </filter>

          <clipPath id={clipPathId}>
            <path d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM18.707 7.79297C18.3165 7.40245 17.6835 7.40244 17.293 7.79297L10.5 14.5859L7.20703 11.293C6.81651 10.9024 6.18349 10.9024 5.79297 11.293C5.40245 11.6835 5.40245 12.3165 5.79297 12.707L9.79297 16.707C10.1835 17.0976 10.8165 17.0976 11.207 16.707L18.707 9.20703C19.0976 8.81651 19.0976 8.18349 18.707 7.79297Z" />
          </clipPath>

          <mask id={maskId}>
            <rect width="100%" height="100%" fill="#fff" />
            <path
              d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM18.707 7.79297C18.3165 7.40245 17.6835 7.40244 17.293 7.79297L10.5 14.5859L7.20703 11.293C6.81651 10.9024 6.18349 10.9024 5.79297 11.293C5.40245 11.6835 5.40245 12.3165 5.79297 12.707L9.79297 16.707C10.1835 17.0976 10.8165 17.0976 11.207 16.707L18.707 9.20703C19.0976 8.81651 19.0976 8.18349 18.707 7.79297Z"
              fill="#000"
            />
          </mask>
        </defs>
      </g>
    </svg>
  );
}

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
      "transition-[background-color,color,transform] duration-300 ease-spring hover:bg-muted/60 hover:text-foreground active:scale-[0.98]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    meter:
      "absolute inset-x-0 top-[calc(100%+0.375rem)] z-20 grid gap-1.5 rounded-xl border border-border bg-background/95 p-2.5 shadow-lg backdrop-blur-sm",
    meterHeader:
      "flex items-center justify-between gap-2 text-[11px] text-muted-foreground",
    meterTrack: "h-1 overflow-hidden rounded-full bg-muted",
    meterBar: "h-full rounded-full bg-foreground",
    criteria: "grid gap-1 pt-0.5 sm:grid-cols-2",
    criterion:
      "flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors duration-200 data-[met=true]:text-emerald-700 dark:data-[met=true]:text-emerald-400",
    criterionIcon: "flex size-3.5 shrink-0 items-center justify-center",
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
  reserveMessageSpace = false,
  required,
  disabled,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  autoComplete = "new-password",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [isMeterOpen, setIsMeterOpen] = useState(false);
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
  const criteriaId =
    showCriteria && isMeterOpen ? `${inputId}-criteria` : undefined;
  const describedBy = [ariaDescribedBy, messageId, criteriaId]
    .filter(Boolean)
    .join(" ");
  const styles = passwordInputVariants({ size });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setInternalValue(event.target.value);
    onChange?.(event);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setIsMeterOpen(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setIsMeterOpen(false);
    onBlur?.(event);
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <button
          type="button"
          data-slot="password-input-toggle"
          className={styles.toggle()}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => setVisible((current) => !current)}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={visible ? "visible" : "hidden"}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.94 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {visible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
        <AnimatePresence initial={false}>
          {showCriteria && isMeterOpen ? (
            <motion.div
              id={criteriaId}
              data-slot="password-input-meter"
              className={styles.meter()}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, scale: 0.985 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -4, scale: 0.99 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.28,
                ease: [0.2, 0, 0, 1],
              }}
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
                  animate={{
                    width: `${meterWidth}%`,
                    opacity: password ? 1 : 0,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.32,
                    ease: [0.4, 0, 0.2, 1],
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
                          className="flex"
                          initial={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.88 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.88 }}
                          transition={{
                            duration: 0.24,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        >
                          {criterion.met ? (
                            <IconCircleCheck className="drop-shadow-[0_1px_2px_rgba(16,185,129,0.25)]" />
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
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {description || error || reserveMessageSpace ? (
        <FieldMessage
          id={messageId}
          description={description}
          error={error}
          reserveSpace={reserveMessageSpace}
        />
      ) : null}
    </Field>
  );
}
