"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Mic,
  Pause,
  Phone,
  PhoneOff,
  Play,
  Square,
  UploadCloud,
  X,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const dynamicIslandVariants = tv({
  slots: {
    root: "flex w-full justify-center px-2",
    island: [
      "relative isolate flex max-w-full items-center overflow-hidden rounded-[2rem] border border-border/50",
      "bg-card/80 text-card-foreground shadow-sm backdrop-blur-xl ring-1 ring-foreground/5",
      "supports-[backdrop-filter]:bg-card/70",
    ],
    glow: "pointer-events-none absolute inset-x-8 -top-10 -z-10 h-20 rounded-full bg-primary/10 blur-2xl",
    topLight:
      "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent",
    content: "relative flex min-w-0 items-center",
    media: [
      "relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-border/60",
      "bg-background text-muted-foreground shadow-xs",
    ],
    mediaRing:
      "pointer-events-none absolute inset-0 rounded-full border border-primary/20",
    copy: "min-w-0 flex-1",
    eyebrow:
      "mb-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground",
    title: "block truncate font-semibold tracking-tight text-foreground",
    description: "block truncate leading-5 text-muted-foreground",
    actions: "flex shrink-0 items-center gap-2",
    button: [
      "inline-flex shrink-0 items-center justify-center rounded-full border border-border/70",
      "bg-background/80 text-muted-foreground shadow-xs transition-colors duration-200",
      "hover:bg-muted hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    pill: "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-muted-foreground text-xs",
    progressTrack:
      "relative h-2 overflow-hidden rounded-full bg-muted shadow-inner",
    progressFill: "relative h-full rounded-full bg-primary",
    statusDot: "size-2.5 rounded-full bg-muted-foreground",
  },
  variants: {
    variant: {
      music: {
        island: "w-[min(94vw,35rem)]",
        content: "w-full gap-3.5 sm:gap-4",
      },
      timer: {
        island: "w-[min(94vw,26rem)]",
        content: "w-full gap-3",
      },
      recording: {
        island: "w-[min(94vw,29rem)] border-destructive/30",
        glow: "bg-destructive/10",
        media: "border-destructive/25 bg-destructive/10 text-destructive",
        mediaRing: "border-destructive/20",
        statusDot: "bg-destructive",
        content: "w-full gap-3",
      },
      confirm: {
        island: "w-[min(94vw,36rem)]",
        content: "w-full gap-3.5",
      },
      notification: {
        island: "w-[min(94vw,31rem)]",
        content: "w-full gap-3",
      },
      progress: {
        island: "w-[min(94vw,34rem)]",
        content: "w-full gap-3.5",
      },
      call: {
        island: "w-[min(94vw,34rem)]",
        media: "border-primary/25 bg-primary/10 text-primary",
        content: "w-full gap-3",
      },
    },
    size: {
      sm: {
        island: "min-h-14 px-3 py-2",
        media: "size-10",
        title: "text-sm",
        description: "text-xs",
        button: "size-9",
      },
      md: {
        island: "min-h-16 px-4 py-3",
        media: "size-12",
        title: "text-[15px]",
        description: "text-xs",
        button: "size-10",
      },
      lg: {
        island: "min-h-[4.75rem] px-5 py-3.5",
        media: "size-14",
        title: "text-base",
        description: "text-sm",
        button: "size-11",
      },
    },
  },
  defaultVariants: {
    variant: "notification",
    size: "md",
  },
});

export type DynamicIslandVariant =
  | "music"
  | "timer"
  | "recording"
  | "confirm"
  | "notification"
  | "progress"
  | "call";

export type DynamicIslandProps = ComponentProps<"div"> &
  VariantProps<typeof dynamicIslandVariants> & {
    variant?: DynamicIslandVariant;
    title?: string;
    description?: string;
    time?: string;
    progress?: number;
    image?: string;
    isPlaying?: boolean;
    isActive?: boolean;
    onPlayPause?: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    onStop?: () => void;
    actions?: ReactNode;
    icon?: ReactNode;
  };

const smoothEase = [0.22, 1, 0.36, 1] as const;
const morphTransition = {
  type: "spring",
  stiffness: 330,
  damping: 34,
  mass: 0.9,
} as const;

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.985, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.26,
      ease: smoothEase,
      staggerChildren: 0.035,
      delayChildren: 0.035,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    filter: "blur(4px)",
    transition: { duration: 0.16, ease: smoothEase },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.24, ease: smoothEase },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.99,
    transition: { duration: 0.14, ease: smoothEase },
  },
};

function clampProgress(progress = 0) {
  return Math.min(100, Math.max(0, progress));
}

function IslandActionButton({
  children,
  label,
  onClick,
  tone = "default",
  disabled,
  className,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  tone?: "default" | "primary" | "destructive";
  disabled?: boolean;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const toneClassName = {
    default: "",
    primary: "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15",
    destructive:
      "border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15",
  }[tone];

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={twMerge(
        dynamicIslandVariants().button(),
        toneClassName,
        className,
      )}
      variants={childVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.035 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.955, y: 0 }}
      transition={morphTransition}
    >
      {children}
    </motion.button>
  );
}

function MediaFrame({
  children,
  image,
  title,
  className,
  ringClassName,
  pulse = false,
}: {
  children?: ReactNode;
  image?: string;
  title?: string;
  className?: string;
  ringClassName?: string;
  pulse?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      layoutId="dynamic-island-media"
      className={twMerge(
        dynamicIslandVariants().media(),
        image ? "bg-cover bg-center" : undefined,
        className,
      )}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
      role={image ? "img" : undefined}
      aria-label={image && title ? `${title} artwork` : undefined}
      variants={childVariants}
      transition={morphTransition}
    >
      {pulse ? (
        <motion.span
          className={twMerge(
            dynamicIslandVariants().mediaRing(),
            ringClassName,
          )}
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.18, 1], opacity: [0.55, 0.18, 0.55] }
          }
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      ) : null}
      {image ? null : children}
    </motion.span>
  );
}

function Equalizer({ active = true }: { active?: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const bars = [0.42, 0.78, 0.55, 0.92, 0.66];

  return (
    <motion.span
      className="flex h-5 shrink-0 items-end gap-0.5"
      variants={childVariants}
      aria-hidden="true"
    >
      {bars.map((height, index) => (
        <motion.span
          key={height}
          className="w-0.5 rounded-full bg-primary"
          animate={
            shouldReduceMotion || !active
              ? { height: `${height * 58}%`, opacity: active ? 1 : 0.45 }
              : {
                  height: [
                    `${height * 42}%`,
                    `${height * 100}%`,
                    `${height * 58}%`,
                  ],
                  opacity: [0.68, 1, 0.78],
                }
          }
          transition={{
            duration: 0.72 + index * 0.08,
            repeat: active ? Infinity : 0,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.span>
  );
}

function CopyBlock({
  eyebrow,
  title,
  description,
  time,
  titleClassName,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  time?: string;
  titleClassName?: string;
}) {
  return (
    <motion.span
      layoutId="dynamic-island-copy"
      className={dynamicIslandVariants().copy()}
      variants={childVariants}
    >
      {eyebrow ? (
        <span className={dynamicIslandVariants().eyebrow()}>
          <span className="size-1 rounded-full bg-primary" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}
      <span
        className={twMerge(dynamicIslandVariants().title(), titleClassName)}
      >
        {title}
        {time ? (
          <span className="ml-2 font-normal text-muted-foreground">{time}</span>
        ) : null}
      </span>
      {description ? (
        <span className={dynamicIslandVariants().description()}>
          {description}
        </span>
      ) : null}
    </motion.span>
  );
}

function TimerRing({ active }: { active?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className="relative grid size-full place-items-center">
      <Clock3 className="size-4" aria-hidden="true" />
      <svg
        className="-rotate-90 pointer-events-none absolute inset-0 size-full text-primary"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="3"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: active ? 0.76 : 0.34,
            opacity: active ? 1 : 0.52,
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.7, ease: smoothEase }
          }
        />
      </svg>
    </span>
  );
}

function RecordingDot({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span
      className="relative grid size-5 place-items-center"
      aria-hidden="true"
    >
      <motion.span
        className={twMerge(
          "absolute size-5 rounded-full bg-destructive/20",
          className,
        )}
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [0.78, 1.45, 0.78], opacity: [0.6, 0, 0.6] }
        }
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="relative size-2.5 rounded-full bg-destructive"
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], opacity: [1, 0.72, 1] }
        }
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}

function ProgressNumber({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className="tabular-nums text-foreground text-sm font-semibold"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
        transition={{ duration: 0.18, ease: smoothEase }}
      >
        {value}%
      </motion.span>
    </AnimatePresence>
  );
}

export function DynamicIsland({
  variant = "notification",
  size = "md",
  title,
  description,
  time,
  progress = 0,
  image,
  isPlaying = false,
  isActive = false,
  onPlayPause,
  onConfirm,
  onCancel,
  onStop,
  actions,
  icon,
  className,
  ...props
}: DynamicIslandProps) {
  const styles = dynamicIslandVariants({ variant, size });
  const shouldReduceMotion = useReducedMotion();
  const value = clampProgress(progress);

  const resolvedTitle =
    title ??
    {
      music: "Midnight City",
      timer: "24:18",
      recording: "Recording",
      confirm: "Apply changes?",
      notification: "Workspace updated",
      progress: "Uploading files",
      call: "Sarah Chen",
    }[variant];

  const resolvedDescription =
    description ??
    {
      music: "M83",
      timer: isActive ? "Focus session running" : "Timer paused",
      recording: "Screen capture",
      confirm: "Review and publish this update.",
      notification: "Design tokens synced successfully.",
      progress: "Syncing registry assets",
      call: "Incoming call",
    }[variant];

  return (
    <div
      data-slot="dynamic-island"
      className={twMerge(styles.root(), className)}
      {...props}
    >
      <motion.div
        layout
        className={styles.island()}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.94, y: 10 }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, y: [0, -1.5, 0] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.2 }
            : {
                ...morphTransition,
                y: {
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        <motion.span
          className={styles.glow()}
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: [0.34, 0.62, 0.34], scale: [0.94, 1.06, 0.94] }
          }
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <span className={styles.topLight()} aria-hidden="true" />

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={variant}
            layout
            className={styles.content()}
            variants={contentVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
          >
            {variant === "music" ? (
              <>
                <MediaFrame
                  image={image}
                  title={resolvedTitle}
                  className={styles.media()}
                  pulse={isPlaying}
                >
                  {icon ?? <Mic className="size-5" aria-hidden="true" />}
                </MediaFrame>
                <CopyBlock
                  eyebrow={isPlaying ? "Now playing" : "Paused"}
                  title={resolvedTitle}
                  description={resolvedDescription}
                />
                <motion.span
                  className="hidden min-w-24 sm:block"
                  variants={childVariants}
                >
                  <span className="mb-1 flex items-center justify-between gap-2">
                    <Equalizer active={isPlaying} />
                    <span className="text-muted-foreground text-[10px]">
                      2:14
                    </span>
                  </span>
                  <span className={styles.progressTrack()}>
                    <motion.span
                      className={styles.progressFill()}
                      initial={{ width: "26%" }}
                      animate={{ width: isPlaying ? "62%" : "42%" }}
                      transition={{
                        duration: isPlaying ? 4.8 : 0.45,
                        ease: "easeInOut",
                      }}
                    />
                  </span>
                </motion.span>
                <IslandActionButton
                  label={isPlaying ? "Pause music" : "Play music"}
                  onClick={onPlayPause}
                  tone="primary"
                  className={styles.button()}
                >
                  {isPlaying ? (
                    <Pause className="size-4" aria-hidden="true" />
                  ) : (
                    <Play className="size-4 fill-current" aria-hidden="true" />
                  )}
                </IslandActionButton>
              </>
            ) : null}

            {variant === "timer" ? (
              <>
                <MediaFrame
                  className={twMerge(
                    styles.media(),
                    isActive ? "text-primary" : undefined,
                  )}
                  pulse={isActive}
                >
                  {icon ?? <TimerRing active={isActive} />}
                </MediaFrame>
                <CopyBlock
                  eyebrow={isActive ? "Timer active" : "Timer paused"}
                  title={time ?? resolvedTitle}
                  description={resolvedDescription}
                  titleClassName="text-xl tabular-nums"
                />
                <motion.span className={styles.pill()} variants={childVariants}>
                  <span
                    className={twMerge(
                      "size-1.5 rounded-full",
                      isActive ? "bg-primary" : "bg-muted-foreground/45",
                    )}
                    aria-hidden="true"
                  />
                  {isActive ? "Running" : "Paused"}
                </motion.span>
              </>
            ) : null}

            {variant === "recording" ? (
              <>
                <MediaFrame className={styles.media()} pulse>
                  <RecordingDot />
                </MediaFrame>
                <CopyBlock
                  eyebrow="Screen recording"
                  title={time ?? "01:32"}
                  description={resolvedTitle}
                  titleClassName="text-lg tabular-nums"
                />
                <IslandActionButton
                  label="Stop recording"
                  onClick={onStop}
                  tone="destructive"
                  className={styles.button()}
                >
                  <Square
                    className="size-3.5 fill-current"
                    aria-hidden="true"
                  />
                </IslandActionButton>
              </>
            ) : null}

            {variant === "confirm" ? (
              <>
                <MediaFrame className={styles.media()}>
                  {icon ?? (
                    <CheckCircle2 className="size-5" aria-hidden="true" />
                  )}
                </MediaFrame>
                <CopyBlock
                  eyebrow="Confirmation"
                  title={resolvedTitle}
                  description={resolvedDescription}
                />
                <motion.span
                  className={styles.actions()}
                  variants={childVariants}
                  initial={shouldReduceMotion ? false : "hidden"}
                  animate="visible"
                  transition={{ staggerChildren: 0.045, delayChildren: 0.08 }}
                >
                  <IslandActionButton
                    label="Cancel"
                    onClick={onCancel}
                    className={styles.button()}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </IslandActionButton>
                  <IslandActionButton
                    label="Confirm"
                    onClick={onConfirm}
                    tone="primary"
                    className={styles.button()}
                  >
                    <Check className="size-4" aria-hidden="true" />
                  </IslandActionButton>
                </motion.span>
              </>
            ) : null}

            {variant === "notification" ? (
              <>
                <MediaFrame className={twMerge(styles.media(), "text-primary")}>
                  {icon ?? <Bell className="size-5" aria-hidden="true" />}
                </MediaFrame>
                <CopyBlock
                  eyebrow={time ?? "Just now"}
                  title={resolvedTitle}
                  description={resolvedDescription}
                />
                <motion.span
                  className={styles.statusDot()}
                  variants={childVariants}
                />
                {actions}
              </>
            ) : null}

            {variant === "progress" ? (
              <>
                <MediaFrame
                  className={twMerge(styles.media(), "text-primary")}
                  pulse={value < 100}
                >
                  {icon ?? (
                    <UploadCloud className="size-5" aria-hidden="true" />
                  )}
                </MediaFrame>
                <motion.span
                  className="min-w-0 flex-1"
                  variants={childVariants}
                >
                  <span className="mb-1.5 flex items-center justify-between gap-4">
                    <span className={styles.title()}>{resolvedTitle}</span>
                    <ProgressNumber value={value} />
                  </span>
                  <span className={styles.progressTrack()}>
                    <motion.span
                      className={styles.progressFill()}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.72, ease: smoothEase }}
                    >
                      <motion.span
                        className="absolute inset-y-0 w-8 bg-primary/25 blur-sm"
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : { x: ["-120%", "360%"] }
                        }
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        aria-hidden="true"
                      />
                    </motion.span>
                  </span>
                </motion.span>
              </>
            ) : null}

            {variant === "call" ? (
              <>
                <MediaFrame
                  image={image}
                  title={resolvedTitle}
                  className={styles.media()}
                  pulse
                >
                  {icon ?? <Phone className="size-5" aria-hidden="true" />}
                </MediaFrame>
                <CopyBlock
                  eyebrow="Incoming call"
                  title={resolvedTitle}
                  description={resolvedDescription}
                />
                <IslandActionButton
                  label="Decline call"
                  onClick={onCancel}
                  tone="destructive"
                  className={styles.button()}
                >
                  <PhoneOff className="size-4" aria-hidden="true" />
                </IslandActionButton>
                <IslandActionButton
                  label="Accept call"
                  onClick={onConfirm}
                  tone="primary"
                  className={styles.button()}
                >
                  <Phone className="size-4" aria-hidden="true" />
                </IslandActionButton>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
