"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const reactiveButtonVariants = tv({
  base: [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-lg border border-transparent bg-clip-padding text-sm font-medium outline-none select-none",
    "transition-[background-color,border-color,border-radius,box-shadow,color,opacity,transform] duration-200 ease-spring",
    "hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      secondary:
        "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      outline:
        "border-border bg-background shadow-xs hover:bg-muted/70 hover:text-foreground",
      ghost:
        "text-foreground hover:bg-muted/70 hover:text-foreground hover:shadow-none",
      destructive:
        "border-destructive/20 bg-destructive/10 text-destructive shadow-xs hover:border-destructive/30 hover:bg-destructive/15",
      link: "text-primary underline-offset-4 hover:translate-y-0 hover:bg-transparent hover:shadow-none hover:underline active:scale-100",
    },
    size: {
      sm: "h-7 gap-1 px-2.5 text-[0.8rem] [&_svg]:size-3.5",
      md: "h-8 gap-1.5 px-3 [&_svg]:size-4",
      lg: "h-9 gap-1.5 px-3.5 [&_svg]:size-4",
      icon: "size-8 [&_svg]:size-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type ReactiveButtonStatus = "idle" | "loading" | "success" | "error";

export type ReactiveButtonProps = ComponentProps<"button"> &
  VariantProps<typeof reactiveButtonVariants> & {
    status?: ReactiveButtonStatus;
    loadingText?: ReactNode;
    successText?: ReactNode;
    errorText?: ReactNode;
    countdown?: number;
    icon?: ReactNode;
    loadingIcon?: ReactNode;
    successIcon?: ReactNode;
    errorIcon?: ReactNode;
    autoReset?: boolean;
    resetDelay?: number;
    onStatusReset?: () => void;
  };

const statusStyles: Record<ReactiveButtonStatus, string> = {
  idle: "",
  loading: "cursor-wait",
  success:
    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
  error: "border-destructive bg-destructive text-white hover:bg-destructive/90",
};

const reactiveTiming = {
  quick: 0.18,
  draw: 0.24,
  settle: 0.32,
  loop: 0.95,
} as const;

const reactiveEase = [0.22, 1, 0.36, 1] as const;
const countdownEase = [0.2, 0.8, 0.2, 1] as const;

type AnimatedStatusIconProps = {
  shouldReduceMotion: boolean;
};

function LoadingIndicator({ shouldReduceMotion }: AnimatedStatusIconProps) {
  return (
    <svg
      data-slot="reactive-button-loading-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.24"
      />
      <motion.g
        style={{ transformOrigin: "12px 12px" }}
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: reactiveTiming.loop,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="22 52"
        />
        <motion.circle
          cx="12"
          cy="4"
          r="1"
          fill="currentColor"
          animate={
            shouldReduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }
          }
          transition={{
            duration: reactiveTiming.loop,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </motion.g>
    </svg>
  );
}

function AnimatedSuccessIcon({ shouldReduceMotion }: AnimatedStatusIconProps) {
  const drawTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: reactiveTiming.draw, ease: reactiveEase };

  return (
    <svg
      data-slot="reactive-button-success-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ transformOrigin: "12px 12px", rotate: -90 }}
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 0.5, pathLength: 1 }}
        transition={drawTransition}
      />
      <motion.path
        d="m8.1 12.15 2.5 2.55 5.45-5.55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: reactiveTiming.draw,
                delay: 0.1,
                ease: reactiveEase,
              }
        }
      />
    </svg>
  );
}

function AnimatedErrorIcon({ shouldReduceMotion }: AnimatedStatusIconProps) {
  return (
    <motion.svg
      data-slot="reactive-button-error-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ transformOrigin: "12px 12px" }}
      initial={shouldReduceMotion ? false : { rotate: -4, scale: 0.94 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: reactiveTiming.draw, ease: reactiveEase }
      }
    >
      <motion.circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ transformOrigin: "12px 12px", rotate: -90 }}
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 0.62, pathLength: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: reactiveTiming.draw, ease: reactiveEase }
        }
      />
      <motion.path
        d="M12 7.75v5.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: reactiveTiming.quick,
                delay: 0.1,
                ease: reactiveEase,
              }
        }
      />
      <motion.circle
        cx="12"
        cy="16.3"
        r="1"
        fill="currentColor"
        style={{ transformOrigin: "12px 16.3px" }}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.35 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                delay: 0.2,
                stiffness: 360,
                damping: 22,
              }
        }
      />
    </motion.svg>
  );
}

function ReactiveButtonSurface({
  status,
  shouldReduceMotion,
}: {
  status: ReactiveButtonStatus;
  shouldReduceMotion: boolean;
}) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {status !== "idle" ? (
        <motion.span
          key={status}
          data-slot="reactive-button-surface"
          className="pointer-events-none absolute inset-0"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : reactiveTiming.quick,
          }}
          aria-hidden="true"
        >
          {status === "loading" ? (
            <motion.span
              className="absolute inset-y-0 w-1/3 bg-foreground/10"
              initial={shouldReduceMotion ? { x: "0%" } : { x: "-120%" }}
              animate={
                shouldReduceMotion ? { x: "0%" } : { x: ["-120%", "360%"] }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 1.1,
                ease: "easeInOut",
                repeat: shouldReduceMotion ? 0 : Number.POSITIVE_INFINITY,
                repeatDelay: 0.12,
              }}
            />
          ) : null}

          {status === "success" ? (
            <>
              <motion.span
                className="absolute inset-0 bg-primary"
                style={{ transformOrigin: "left center" }}
                initial={shouldReduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : reactiveTiming.settle,
                  ease: reactiveEase,
                }}
              />
              <motion.span
                className="absolute inset-y-0 left-1/2 aspect-square rounded-full bg-background/20"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, scale: 0.7, x: "-50%" }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 0, x: "-50%" }
                    : {
                        opacity: [0, 0.38, 0],
                        scale: [0.7, 1.45],
                        x: "-50%",
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.42,
                  delay: 0.08,
                  ease: reactiveEase,
                }}
              />
            </>
          ) : null}

          {status === "error" ? (
            <>
              <motion.span
                className="absolute inset-0 bg-destructive"
                style={{ transformOrigin: "center" }}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : reactiveTiming.draw,
                  ease: reactiveEase,
                }}
              />
              <motion.span
                className="absolute inset-0 bg-primary-foreground/10"
                animate={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: [0, 0.4, 0] }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : reactiveTiming.settle,
                  ease: "easeOut",
                }}
              />
            </>
          ) : null}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

function ReactiveButtonCountdownSurface({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean;
}) {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 aspect-square rounded-full bg-destructive/20"
      initial={
        shouldReduceMotion ? false : { opacity: 0, scale: 0.65, x: "24%" }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 0.18 }
          : {
              opacity: [0, 0.35, 0.18],
              scale: [0.65, 1.1, 1],
              x: ["24%", "4%", "0%"],
            }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.75, x: "16%" }
      }
      transition={{
        duration: shouldReduceMotion ? 0.12 : 0.42,
        ease: countdownEase,
      }}
    />
  );
}

function ReactiveButton({
  variant = "default",
  size = "md",
  status = "idle",
  loadingText = "Loading...",
  successText = "Done",
  errorText = "Try again",
  countdown,
  icon,
  loadingIcon,
  successIcon,
  errorIcon,
  autoReset = false,
  resetDelay = 1800,
  onStatusReset,
  className,
  children,
  disabled,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-busy": ariaBusy,
  ...props
}: ReactiveButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [autoResetStatus, setAutoResetStatus] =
    useState<ReactiveButtonStatus | null>(null);
  const onStatusResetRef = useRef(onStatusReset);
  const visibleStatus = autoResetStatus === status ? "idle" : status;
  const isLoading = visibleStatus === "loading";
  const isIconButton = size === "icon";
  const displayCountdown =
    typeof countdown === "number" && Number.isFinite(countdown)
      ? Math.max(0, Math.floor(countdown))
      : null;
  const hasCountdown = displayCountdown !== null;
  const resolvedAriaLabel =
    ariaLabel ??
    (isIconButton
      ? typeof children === "string"
        ? children
        : "Button action"
      : undefined);

  useEffect(() => {
    if (autoResetStatus && autoResetStatus !== status) {
      setAutoResetStatus(null);
    }
  }, [autoResetStatus, status]);

  useEffect(() => {
    onStatusResetRef.current = onStatusReset;
  }, [onStatusReset]);

  useEffect(() => {
    if (!autoReset || (status !== "success" && status !== "error")) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setAutoResetStatus(status);
      onStatusResetRef.current?.();
    }, resetDelay);

    return () => window.clearTimeout(resetTimer);
  }, [autoReset, resetDelay, status]);

  const stateContent: Record<
    ReactiveButtonStatus,
    { icon?: ReactNode; label: ReactNode }
  > = {
    idle: { icon, label: children },
    loading: {
      icon: loadingIcon ?? (
        <LoadingIndicator shouldReduceMotion={Boolean(shouldReduceMotion)} />
      ),
      label: loadingText,
    },
    success: {
      icon: successIcon ?? (
        <AnimatedSuccessIcon shouldReduceMotion={Boolean(shouldReduceMotion)} />
      ),
      label: successText,
    },
    error: {
      icon: errorIcon ?? (
        <AnimatedErrorIcon shouldReduceMotion={Boolean(shouldReduceMotion)} />
      ),
      label: errorText,
    },
  };
  const activeContent = stateContent[visibleStatus];
  const contentKey = `${visibleStatus}-${hasCountdown ? "countdown" : "default"}`;
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: reactiveTiming.quick, ease: reactiveEase };

  return (
    <button
      type="button"
      data-slot="reactive-button"
      data-status={visibleStatus}
      aria-busy={ariaBusy ?? isLoading}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledby}
      disabled={disabled || isLoading}
      className={twMerge(
        reactiveButtonVariants({ variant, size }),
        statusStyles[visibleStatus],
        hasCountdown && "rounded-full",
        className,
      )}
      {...props}
    >
      <AnimatePresence>
        {hasCountdown ? (
          <ReactiveButtonCountdownSurface
            shouldReduceMotion={Boolean(shouldReduceMotion)}
          />
        ) : null}
      </AnimatePresence>
      <ReactiveButtonSurface
        status={visibleStatus}
        shouldReduceMotion={Boolean(shouldReduceMotion)}
      />
      <span
        data-slot="reactive-button-content"
        className="relative z-10 grid items-center justify-items-center"
        aria-live={visibleStatus !== "idle" ? "polite" : undefined}
        aria-atomic="true"
      >
        {Object.entries(stateContent).map(([state, content]) => (
          <span
            key={`reactive-button-measure-${state}`}
            className="invisible col-start-1 row-start-1 inline-flex items-center gap-1.5"
            aria-hidden="true"
          >
            {content.icon ? <span className="size-4 shrink-0" /> : null}
            {!isIconButton ? content.label : null}
          </span>
        ))}

        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={contentKey}
            data-slot="reactive-button-state"
            className="col-start-1 row-start-1 inline-flex items-center gap-1.5"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -2 }}
            transition={transition}
          >
            {activeContent.icon ? (
              <motion.span
                className="inline-flex shrink-0 items-center justify-center"
                initial={
                  shouldReduceMotion || visibleStatus !== "success"
                    ? false
                    : { scale: 0.82 }
                }
                animate={{ scale: 1 }}
                transition={transition}
                aria-hidden="true"
              >
                {activeContent.icon}
              </motion.span>
            ) : null}
            {isIconButton ? (
              <span className="sr-only">{activeContent.label}</span>
            ) : (
              activeContent.label
            )}
          </motion.span>
        </AnimatePresence>
      </span>

      <AnimatePresence initial={false}>
        {hasCountdown ? (
          <motion.span
            aria-hidden="true"
            className="relative -mr-0.5 ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-destructive/30 bg-destructive/15 font-semibold text-[0.625rem] text-destructive tabular-nums"
            initial={
              shouldReduceMotion
                ? false
                : { marginLeft: 0, opacity: 0, scale: 0.45, width: 0 }
            }
            animate={{ marginLeft: 4, opacity: 1, scale: 1, width: 20 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { marginLeft: 0, opacity: 0, scale: 0.45, width: 0 }
            }
            transition={{
              duration: shouldReduceMotion ? 0.12 : reactiveTiming.settle,
              ease: countdownEase,
            }}
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={`reactive-button-countdown-pulse-${displayCountdown}`}
                className="pointer-events-none absolute inset-0 rounded-full bg-destructive/25"
                initial={
                  shouldReduceMotion ? false : { opacity: 0.5, scale: 0.8 }
                }
                animate={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.45 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.42,
                  ease: "easeOut",
                }}
              />
            </AnimatePresence>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={displayCountdown}
                className="relative"
                initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0.1 : reactiveTiming.draw,
                }}
              >
                {displayCountdown}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ) : null}
      </AnimatePresence>

      {hasCountdown ? (
        <span className="sr-only" aria-live="polite">
          {displayCountdown} seconds remaining
        </span>
      ) : null}
    </button>
  );
}

export { ReactiveButton };
