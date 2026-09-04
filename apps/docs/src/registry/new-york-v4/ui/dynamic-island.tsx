"use client";

import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Mic,
  Music2,
  Pause,
  Play,
  Square,
  UploadCloud,
  X,
} from "lucide-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import { spring } from "@/registry/new-york-v4/lib/motion-tokens";

export const dynamicIslandVariants = tv({
  slots: {
    root: "not-prose flex w-full justify-center px-2",
    splitGroup: "flex max-w-full items-center justify-center gap-2",
    island: [
      "relative isolate flex max-w-full transform-gpu cursor-pointer select-none items-center overflow-hidden will-change-transform",
      "border border-border/30 bg-foreground text-background shadow-sm",
      "transition-colors dark:bg-card dark:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    ],
    compact: "h-10 min-w-40 gap-2.5 rounded-full px-3 py-1.5",
    minimal: "h-9 w-12 justify-center rounded-full px-1.5 py-1",
    expanded: "min-h-24 w-[min(94vw,25rem)] rounded-[2rem] px-3.5 py-3",
    transient: "min-h-20 w-[min(94vw,23rem)] rounded-[2rem] px-3.5 py-2.5",
    liveActivity: "min-h-24 w-[min(94vw,26rem)] rounded-[2rem] px-3.5 py-3",
    splitPrimary: "h-10 min-w-44 gap-2.5 rounded-full px-3 py-1.5",
    splitSecondary: "h-10 w-20 justify-center rounded-full px-2.5 py-1.5",
    compactContent: "flex min-w-0 items-center gap-2",
    expandedContent: "flex w-full min-w-0 items-center gap-3",
    media: [
      "relative grid shrink-0 place-items-center overflow-hidden rounded-full",
      "bg-background/10 text-background dark:bg-muted dark:text-foreground",
    ],
    mediaCompact: "size-6",
    mediaExpanded: "size-11",
    mediaLarge: "size-12",
    copy: "min-w-0 flex-1",
    eyebrow:
      "m-0 mb-1 truncate text-[10px] font-medium uppercase leading-none tracking-wide text-background/60 dark:text-muted-foreground",
    title:
      "m-0 truncate text-sm font-medium leading-none text-background dark:text-foreground",
    description:
      "m-0 mt-1 truncate text-xs leading-tight text-background/70 dark:text-muted-foreground",
    timerTitle:
      "m-0 truncate font-medium tabular-nums text-[22px] leading-none text-background dark:text-foreground",
    actions: "flex shrink-0 items-center gap-1.5",
    actionButton: [
      "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
      "bg-background text-foreground shadow-xs transition-colors hover:bg-muted",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    compactPill:
      "inline-flex min-w-0 items-center gap-1.5 truncate text-xs font-medium leading-none text-background dark:text-foreground",
    mutedText:
      "truncate text-[11px] leading-none text-background/65 dark:text-muted-foreground",
    progressTrack:
      "relative h-2 overflow-hidden rounded-full bg-background/15 dark:bg-muted",
    progressTrackSuccess:
      "relative h-2 overflow-hidden rounded-full bg-green-500/15",
    progressFill: "h-full rounded-full bg-background dark:bg-primary",
    progressFillSuccess:
      "h-full rounded-full bg-green-500/70 dark:bg-green-400/80",
    statusDot: "size-1.5 shrink-0 rounded-full bg-background dark:bg-primary",
    successMedia:
      "bg-green-500/15 text-green-500 dark:bg-green-500/10 dark:text-green-400",
    successText: "text-green-500 dark:text-green-400",
    successDot: "bg-green-500 dark:bg-green-400",
  },
  variants: {
    size: {
      sm: {
        compact: "h-9 min-w-32 px-2.5",
        minimal: "h-8 w-10",
        expanded: "min-h-20 w-[min(94vw,21rem)] px-3 py-2.5",
        transient: "min-h-18 w-[min(94vw,20rem)] px-3 py-2",
        liveActivity: "min-h-20 w-[min(94vw,22rem)] px-3 py-2.5",
        splitPrimary: "h-9 min-w-36 px-2.5",
        splitSecondary: "h-9 w-16",
        mediaCompact: "size-5",
        mediaExpanded: "size-9",
        mediaLarge: "size-10",
        actionButton: "size-7",
        title: "text-[13px]",
        description: "text-[11px]",
      },
      md: {},
      lg: {
        compact: "h-11 min-w-48 px-3.5",
        minimal: "h-10 w-14",
        expanded: "min-h-28 w-[min(94vw,30rem)] px-4 py-3.5",
        transient: "min-h-24 w-[min(94vw,28rem)] px-4 py-3",
        liveActivity: "min-h-28 w-[min(94vw,31rem)] px-4 py-3.5",
        splitPrimary: "h-11 min-w-52 px-3.5",
        splitSecondary: "h-11 w-22",
        mediaCompact: "size-7",
        mediaExpanded: "size-12",
        mediaLarge: "size-14",
        actionButton: "size-9",
        title: "text-[15px]",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type DynamicIslandMode =
  | "compact"
  | "minimal"
  | "expanded"
  | "split"
  | "transient"
  | "liveActivity";

export type DynamicIslandVariant =
  | "music"
  | "timer"
  | "recording"
  | "confirm"
  | "notification"
  | "progress";

export type DynamicIslandProps = ComponentProps<"div"> &
  VariantProps<typeof dynamicIslandVariants> & {
    variant?: DynamicIslandVariant;
    mode?: DynamicIslandMode;
    defaultMode?: DynamicIslandMode;
    autoCollapse?: boolean;
    autoCollapseDelay?: number;
    secondaryActivity?: DynamicIslandProps;
    onModeChange?: (mode: DynamicIslandMode) => void;
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

type IslandStyles = ReturnType<typeof dynamicIslandVariants>;
type FeedbackState = "success" | null;

type DynamicIslandActivity = {
  variant: DynamicIslandVariant;
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

const islandTransition = {
  type: "spring",
  stiffness: 280,
  damping: 32,
  mass: 0.92,
} satisfies Transition;

const reducedTransition = { duration: 0 } satisfies Transition;

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 2, scale: 0.992 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.moderate,
  },
  exit: {
    opacity: 0,
    y: -2,
    scale: 0.995,
    transition: spring.fast,
  },
};

const defaults: Record<
  DynamicIslandVariant,
  { title: string; description: string; time?: string }
> = {
  music: {
    title: "Midnight City",
    description: "M83",
  },
  timer: {
    title: "24:18",
    description: "Focus session",
  },
  recording: {
    title: "Screen Recording",
    description: "Recording in progress",
    time: "01:32",
  },
  confirm: {
    title: "Apply changes?",
    description: "Review and publish this update.",
  },
  notification: {
    title: "Workspace updated",
    description: "Design tokens synced successfully.",
    time: "Now",
  },
  progress: {
    title: "Uploading files",
    description: "Syncing registry assets",
  },
};

function clampProgress(progress = 0) {
  return Math.min(100, Math.max(0, progress));
}

function normalizeActivity(
  activity?: Partial<DynamicIslandProps>,
): DynamicIslandActivity {
  return {
    variant: activity?.variant ?? "notification",
    title: activity?.title,
    description: activity?.description,
    time: activity?.time,
    progress: activity?.progress,
    image: activity?.image,
    isPlaying: activity?.isPlaying,
    isActive: activity?.isActive,
    onPlayPause: activity?.onPlayPause,
    onConfirm: activity?.onConfirm,
    onCancel: activity?.onCancel,
    onStop: activity?.onStop,
    actions: activity?.actions,
    icon: activity?.icon,
  };
}

function getActivityCopy(activity: DynamicIslandActivity) {
  const fallback = defaults[activity.variant];
  const progress = clampProgress(activity.progress);

  if (activity.variant === "progress" && progress >= 100) {
    return {
      title: "Upload complete",
      description: activity.description ?? "All files are synced.",
      time: activity.time,
    };
  }

  return {
    title: activity.title ?? fallback.title,
    description: activity.description ?? fallback.description,
    time: activity.time ?? fallback.time,
  };
}

function getModeClassName(mode: DynamicIslandMode, styles: IslandStyles) {
  if (mode === "minimal") {
    return styles.minimal();
  }

  if (mode === "expanded") {
    return styles.expanded();
  }

  if (mode === "transient") {
    return styles.transient();
  }

  if (mode === "liveActivity") {
    return styles.liveActivity();
  }

  return styles.compact();
}

function getAriaLabel(
  activity: DynamicIslandActivity,
  mode: DynamicIslandMode,
) {
  const copy = getActivityCopy(activity);
  const modeLabel =
    mode === "liveActivity" ? "live activity" : mode.toLowerCase();

  return `${copy.title}, ${modeLabel} dynamic island`;
}

function isDetailedMode(mode: DynamicIslandMode) {
  return mode === "expanded" || mode === "transient" || mode === "liveActivity";
}

function ActivityIcon({
  activity,
  className,
}: {
  activity: DynamicIslandActivity;
  className?: string;
}) {
  if (activity.icon) {
    return <span className={className}>{activity.icon}</span>;
  }

  const iconClassName = twMerge("size-4", className);

  if (activity.variant === "music") {
    return <Music2 className={iconClassName} aria-hidden="true" />;
  }

  if (activity.variant === "timer") {
    return <Clock3 className={iconClassName} aria-hidden="true" />;
  }

  if (activity.variant === "recording") {
    return <Mic className={iconClassName} aria-hidden="true" />;
  }

  if (activity.variant === "confirm") {
    return <CheckCircle2 className={iconClassName} aria-hidden="true" />;
  }

  if (activity.variant === "progress") {
    return <UploadCloud className={iconClassName} aria-hidden="true" />;
  }

  return <Bell className={iconClassName} aria-hidden="true" />;
}

function MediaOrb({
  activity,
  styles,
  layoutId,
  expanded,
  pulse,
  children,
  className,
}: {
  activity: DynamicIslandActivity;
  styles: IslandStyles;
  layoutId: string;
  expanded?: boolean;
  pulse?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      layout
      layoutId={layoutId}
      className={twMerge(
        styles.media(),
        expanded ? styles.mediaExpanded() : styles.mediaCompact(),
        activity.variant === "recording"
          ? "bg-destructive/15 text-destructive dark:bg-destructive/20"
          : undefined,
        activity.image ? "bg-cover bg-center" : undefined,
        className,
      )}
      style={
        activity.image
          ? { backgroundImage: `url(${activity.image})` }
          : undefined
      }
      transition={shouldReduceMotion ? reducedTransition : islandTransition}
      role={activity.image ? "img" : undefined}
      aria-label={
        activity.image
          ? `${getActivityCopy(activity).title} artwork`
          : undefined
      }
    >
      {pulse ? (
        <motion.span
          className={twMerge(
            "absolute inset-0 rounded-full",
            activity.variant === "recording"
              ? "bg-destructive/25"
              : "bg-background/20 dark:bg-primary/20",
          )}
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [0.86, 1.45, 0.86], opacity: [0.6, 0, 0.6] }
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      ) : null}
      {activity.image
        ? null
        : (children ?? <ActivityIcon activity={activity} />)}
    </motion.span>
  );
}

function Equalizer({ active }: { active?: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const bars = [
    { id: "low", height: 0.4 },
    { id: "peak", height: 0.8 },
    { id: "mid", height: 0.56 },
    { id: "high", height: 0.95 },
  ];

  return (
    <span className="flex h-4 shrink-0 items-end gap-0.5" aria-hidden="true">
      {bars.map((bar) => (
        <motion.span
          key={bar.id}
          className="w-0.5 rounded-full bg-background dark:bg-primary"
          animate={
            shouldReduceMotion || !active
              ? { height: `${bar.height * 54}%`, opacity: active ? 1 : 0.42 }
              : {
                  height: [
                    `${bar.height * 42}%`,
                    `${bar.height * 100}%`,
                    `${bar.height * 58}%`,
                  ],
                  opacity: [0.65, 1, 0.75],
                }
          }
          transition={{
            duration:
              bar.id === "low"
                ? 0.7
                : bar.id === "peak"
                  ? 0.78
                  : bar.id === "mid"
                    ? 0.86
                    : 0.94,
            repeat: active ? Infinity : 0,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

function RecordingDot({ compact = false }: { compact?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span
      className={twMerge(
        "relative grid place-items-center",
        compact ? "size-4" : "size-5",
      )}
      aria-hidden="true"
    >
      <motion.span
        className="absolute size-full rounded-full bg-destructive/20"
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [0.76, 1.45, 0.76], opacity: [0.62, 0, 0.62] }
        }
        transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className={twMerge(
          "relative rounded-full bg-destructive",
          compact ? "size-2" : "size-2.5",
        )}
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], opacity: [1, 0.72, 1] }
        }
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}

function SuccessMark({ styles }: { styles: IslandStyles }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className="relative grid size-full place-items-center"
      initial={shouldReduceMotion ? false : { scale: 0.72, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? reducedTransition
          : { type: "spring", stiffness: 520, damping: 28, mass: 0.62 }
      }
    >
      <motion.span
        className="absolute size-full rounded-full bg-green-500/10"
        initial={shouldReduceMotion ? false : { scale: 0.65, opacity: 0.7 }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.35 }
            : { scale: [0.72, 1.28], opacity: [0.42, 0] }
        }
        transition={
          shouldReduceMotion
            ? reducedTransition
            : { duration: 0.58, ease: [0.22, 1, 0.36, 1] }
        }
        aria-hidden="true"
      />
      <Check
        className={twMerge("relative size-5", styles.successText())}
        aria-hidden="true"
      />
    </motion.span>
  );
}

function TimerRing({
  active,
  compact,
}: {
  active?: boolean;
  compact?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className="relative grid size-full place-items-center">
      <Clock3
        className={twMerge(compact ? "size-3.5" : "size-4")}
        aria-hidden="true"
      />
      <motion.svg
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 48 48"
        aria-hidden="true"
        animate={
          shouldReduceMotion || !active
            ? { rotate: -90 }
            : { rotate: [-90, 270] }
        }
        transition={
          shouldReduceMotion || !active
            ? reducedTransition
            : { duration: 18, repeat: Infinity, ease: "linear" }
        }
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="3"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={
            active
              ? { pathLength: [0.64, 0.82, 0.64], opacity: [0.76, 1, 0.76] }
              : { pathLength: 0.28, opacity: 0.5 }
          }
          transition={
            shouldReduceMotion
              ? reducedTransition
              : {
                  duration: active ? 2.8 : 0.7,
                  repeat: active ? Infinity : 0,
                  ease: "easeInOut",
                }
          }
        />
      </motion.svg>
    </span>
  );
}

function ProgressNumber({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className="shrink-0 tabular-nums"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
        transition={spring.fast}
      >
        {value}%
      </motion.span>
    </AnimatePresence>
  );
}

function IslandActionButton({
  label,
  children,
  onClick,
  tone = "default",
  styles,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  tone?: "default" | "primary" | "destructive";
  styles: IslandStyles;
}) {
  const shouldReduceMotion = useReducedMotion();
  const toneClassName = {
    default: "",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-primary-foreground hover:bg-destructive/90",
  }[tone];

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={twMerge(styles.actionButton(), toneClassName)}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      transition={shouldReduceMotion ? reducedTransition : islandTransition}
    >
      {children}
    </motion.button>
  );
}

function CopyBlock({
  activity,
  styles,
  timer,
  eyebrow,
}: {
  activity: DynamicIslandActivity;
  styles: IslandStyles;
  timer?: boolean;
  eyebrow?: string;
}) {
  const copy = getActivityCopy(activity);

  return (
    <motion.span
      layout
      layoutId={`dynamic-island-${activity.variant}-copy`}
      className={styles.copy()}
      transition={islandTransition}
    >
      {eyebrow ? <p className={styles.eyebrow()}>{eyebrow}</p> : null}
      <p className={timer ? styles.timerTitle() : styles.title()}>
        {activity.variant === "recording"
          ? (activity.time ?? copy.time)
          : copy.title}
      </p>
      <p className={styles.description()}>
        {activity.variant === "recording" ? copy.title : copy.description}
      </p>
    </motion.span>
  );
}

function CompactContent({
  activity,
  mode,
  styles,
  scope,
  feedback,
}: {
  activity: DynamicIslandActivity;
  mode: "compact" | "minimal";
  styles: IslandStyles;
  scope: string;
  feedback: FeedbackState;
}) {
  const copy = getActivityCopy(activity);
  const progress = clampProgress(activity.progress);

  if (mode === "minimal") {
    return (
      <motion.div
        key={`${scope}-minimal-${feedback ?? activity.variant}`}
        layout
        className="flex items-center justify-center"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {feedback === "success" || progress >= 100 ? (
          <Check
            className={twMerge("size-4", styles.successText())}
            aria-hidden="true"
          />
        ) : activity.variant === "recording" ? (
          <RecordingDot compact />
        ) : (
          <ActivityIcon activity={activity} className="size-4" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`${scope}-compact-${feedback ?? activity.variant}`}
      layout
      className={styles.compactContent()}
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {feedback === "success" || progress >= 100 ? (
        <>
          <Check
            className={twMerge("size-4 shrink-0", styles.successText())}
            aria-hidden="true"
          />
          <span className={twMerge(styles.compactPill(), styles.successText())}>
            Done
          </span>
        </>
      ) : null}

      {feedback !== "success" && activity.variant === "music" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
          >
            <ActivityIcon activity={activity} className="size-3.5" />
          </MediaOrb>
          <Equalizer active={activity.isPlaying} />
        </>
      ) : null}

      {feedback !== "success" && activity.variant === "timer" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
          >
            <TimerRing active={activity.isActive} compact />
          </MediaOrb>
          <span className={styles.compactPill()}>
            {activity.time ?? copy.title}
          </span>
        </>
      ) : null}

      {feedback !== "success" && activity.variant === "recording" ? (
        <>
          <RecordingDot compact />
          <span className={styles.compactPill()}>
            {activity.time ?? copy.time ?? "00:00"}
          </span>
        </>
      ) : null}

      {feedback !== "success" && activity.variant === "progress" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
          >
            <ActivityIcon activity={activity} className="size-3.5" />
          </MediaOrb>
          <span className={styles.compactPill()}>
            <ProgressNumber value={progress} />
          </span>
        </>
      ) : null}

      {feedback !== "success" &&
      (activity.variant === "notification" ||
        activity.variant === "confirm") ? (
        <>
          <ActivityIcon activity={activity} className="size-4 shrink-0" />
          <span className={styles.statusDot()} aria-hidden="true" />
        </>
      ) : null}
    </motion.div>
  );
}

function ExpandedContent({
  activity,
  styles,
  scope,
  feedback,
  onConfirmSuccess,
}: {
  activity: DynamicIslandActivity;
  styles: IslandStyles;
  scope: string;
  feedback: FeedbackState;
  onConfirmSuccess: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const copy = getActivityCopy(activity);
  const progress = clampProgress(activity.progress);
  const showSuccess = feedback === "success" || progress >= 100;

  if (showSuccess) {
    return (
      <motion.div
        key={`${scope}-success`}
        layout
        className={styles.expandedContent()}
        variants={contentVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        exit="exit"
      >
        <MediaOrb
          activity={{ ...activity, variant: "confirm" }}
          styles={styles}
          layoutId={`${scope}-media`}
          expanded
          className={styles.successMedia()}
        >
          <SuccessMark styles={styles} />
        </MediaOrb>
        <span className={styles.copy()}>
          <motion.p
            className={twMerge(styles.title(), styles.successText())}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.16 }}
          >
            Completed
          </motion.p>
          <p className={styles.description()}>{copy.description}</p>
          <span className="mt-2 block">
            <span className={styles.progressTrackSuccess()}>
              <motion.span
                className={styles.progressFillSuccess()}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={
                  shouldReduceMotion
                    ? reducedTransition
                    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
                }
              />
            </span>
          </span>
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`${scope}-expanded-${activity.variant}`}
      layout
      className={styles.expandedContent()}
      variants={contentVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      exit="exit"
    >
      {activity.variant === "music" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
            expanded
          >
            <ActivityIcon activity={activity} className="size-5" />
          </MediaOrb>
          <span className={styles.copy()}>
            <p className={styles.eyebrow()}>
              {activity.isPlaying ? "Now playing" : "Paused"}
            </p>
            <p className={styles.title()}>{copy.title}</p>
            <p className={styles.description()}>{copy.description}</p>
            <span className="mt-2 block">
              <span className={styles.progressTrack()}>
                <motion.span
                  className={styles.progressFill()}
                  initial={{ width: "24%" }}
                  animate={{ width: activity.isPlaying ? "64%" : "42%" }}
                  transition={{
                    duration: activity.isPlaying ? 5.5 : 0.35,
                    ease: "easeInOut",
                  }}
                />
              </span>
            </span>
          </span>
          <IslandActionButton
            label={activity.isPlaying ? "Pause music" : "Play music"}
            onClick={activity.onPlayPause}
            tone="primary"
            styles={styles}
          >
            {activity.isPlaying ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4 fill-current" aria-hidden="true" />
            )}
          </IslandActionButton>
        </>
      ) : null}

      {activity.variant === "timer" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
            expanded
            pulse={activity.isActive}
          >
            <TimerRing active={activity.isActive} />
          </MediaOrb>
          <CopyBlock
            activity={activity}
            styles={styles}
            timer
            eyebrow={activity.isActive ? "Timer running" : "Timer paused"}
          />
          <span className={styles.mutedText()}>
            {activity.isActive ? "Running" : "Paused"}
          </span>
        </>
      ) : null}

      {activity.variant === "recording" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
            expanded
          >
            <RecordingDot />
          </MediaOrb>
          <CopyBlock activity={activity} styles={styles} timer eyebrow="Live" />
          <IslandActionButton
            label="Stop recording"
            onClick={activity.onStop}
            tone="destructive"
            styles={styles}
          >
            <Square className="size-3.5 fill-current" aria-hidden="true" />
          </IslandActionButton>
        </>
      ) : null}

      {activity.variant === "progress" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
            expanded
            pulse={progress < 100}
            className="text-background/90 dark:text-primary"
          >
            <ActivityIcon activity={activity} className="size-5" />
          </MediaOrb>
          <span className={styles.copy()}>
            <span className="mb-1.5 flex min-w-0 items-center justify-between gap-3">
              <p className={styles.title()}>{copy.title}</p>
              <span
                className={twMerge(
                  styles.mutedText(),
                  "font-medium text-background dark:text-primary",
                )}
              >
                <ProgressNumber value={progress} />
              </span>
            </span>
            <p className={twMerge(styles.description(), "mb-2")}>
              {copy.description}
            </p>
            <span className={styles.progressTrack()}>
              <motion.span
                className={styles.progressFill()}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={
                  shouldReduceMotion
                    ? reducedTransition
                    : { type: "spring", stiffness: 420, damping: 36, mass: 0.8 }
                }
              />
            </span>
          </span>
        </>
      ) : null}

      {activity.variant === "notification" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
            expanded
          >
            <ActivityIcon activity={activity} className="size-5" />
          </MediaOrb>
          <CopyBlock activity={activity} styles={styles} eyebrow={copy.time} />
          {activity.actions ? (
            <span className={styles.actions()}>{activity.actions}</span>
          ) : (
            <span className={styles.statusDot()} aria-hidden="true" />
          )}
        </>
      ) : null}

      {activity.variant === "confirm" ? (
        <>
          <MediaOrb
            activity={activity}
            styles={styles}
            layoutId={`${scope}-media`}
            expanded
          >
            <ActivityIcon activity={activity} className="size-5" />
          </MediaOrb>
          <CopyBlock activity={activity} styles={styles} eyebrow="Confirm" />
          <span className={styles.actions()}>
            <IslandActionButton
              label="Cancel"
              onClick={activity.onCancel}
              styles={styles}
            >
              <X className="size-4" aria-hidden="true" />
            </IslandActionButton>
            <IslandActionButton
              label="Confirm"
              onClick={onConfirmSuccess}
              tone="primary"
              styles={styles}
            >
              <Check className="size-4" aria-hidden="true" />
            </IslandActionButton>
          </span>
        </>
      ) : null}
    </motion.div>
  );
}

function IslandSurface({
  activity,
  mode,
  styles,
  scope,
  feedback,
  onToggle,
  onExpandFromSplit,
  onConfirmSuccess,
  onTransientBlur,
  primarySplit,
  secondarySplit,
}: {
  activity: DynamicIslandActivity;
  mode: DynamicIslandMode;
  styles: IslandStyles;
  scope: string;
  feedback: FeedbackState;
  onToggle: () => void;
  onExpandFromSplit?: () => void;
  onConfirmSuccess: () => void;
  onTransientBlur: () => void;
  primarySplit?: boolean;
  secondarySplit?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const hoverExpandedRef = useRef(false);
  const detailed = isDetailedMode(mode);
  const surfaceMode = mode === "split" ? "compact" : mode;

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const requestLongExpand = useCallback(() => {
    longPressTriggeredRef.current = true;
    onExpandFromSplit?.();
    if (!(onExpandFromSplit || detailed)) {
      onToggle();
    }
  }, [detailed, onExpandFromSplit, onToggle]);

  const handleClick = useCallback(() => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    hoverExpandedRef.current = false;

    if (onExpandFromSplit) {
      onExpandFromSplit();
      return;
    }

    onToggle();
  }, [onExpandFromSplit, onToggle]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      handleClick();
    },
    [handleClick],
  );

  useEffect(() => {
    return () => {
      clearPressTimer();
      clearHoverTimer();
    };
  }, [clearHoverTimer, clearPressTimer]);

  return (
    <motion.div
      layout
      layoutId={`${scope}-surface`}
      role="button"
      tabIndex={0}
      aria-expanded={detailed}
      aria-label={getAriaLabel(activity, surfaceMode)}
      className={twMerge(
        styles.island(),
        getModeClassName(surfaceMode, styles),
        primarySplit ? styles.splitPrimary() : undefined,
        secondarySplit ? styles.splitSecondary() : undefined,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={() => {
        clearPressTimer();
        pressTimerRef.current = setTimeout(requestLongExpand, 420);
      }}
      onPointerUp={clearPressTimer}
      onPointerCancel={clearPressTimer}
      onMouseEnter={() => {
        if (detailed || onExpandFromSplit) {
          return;
        }
        clearHoverTimer();
        hoverTimerRef.current = setTimeout(() => {
          hoverExpandedRef.current = true;
          onToggle();
        }, 260);
      }}
      onMouseLeave={() => {
        clearHoverTimer();

        if (hoverExpandedRef.current && isDetailedMode(surfaceMode)) {
          hoverTimerRef.current = setTimeout(() => {
            hoverExpandedRef.current = false;
            onToggle();
          }, 140);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          hoverExpandedRef.current = false;
          onTransientBlur();
        }
      }}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={
        shouldReduceMotion ? undefined : { opacity: 0, scale: 0.985, y: -4 }
      }
      whileTap={shouldReduceMotion ? undefined : { scale: 0.996 }}
      transition={shouldReduceMotion ? reducedTransition : islandTransition}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDetailedMode(surfaceMode) ? (
          <ExpandedContent
            key={`${scope}-expanded-${feedback ?? activity.variant}`}
            activity={activity}
            styles={styles}
            scope={scope}
            feedback={feedback}
            onConfirmSuccess={onConfirmSuccess}
          />
        ) : (
          <CompactContent
            key={`${scope}-${surfaceMode}-${feedback ?? activity.variant}`}
            activity={activity}
            mode={surfaceMode}
            styles={styles}
            scope={scope}
            feedback={feedback}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DynamicIsland({
  variant = "notification",
  size = "md",
  mode,
  defaultMode = "compact",
  autoCollapse = true,
  autoCollapseDelay = 3200,
  secondaryActivity,
  onModeChange,
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
  const styles = dynamicIslandVariants({ size });
  const [internalMode, setInternalMode] =
    useState<DynamicIslandMode>(defaultMode);
  const [activeSource, setActiveSource] = useState<"primary" | "secondary">(
    "primary",
  );
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressCompleteRef = useRef(false);
  const currentMode = mode ?? internalMode;

  const primaryActivity = useMemo(
    () =>
      normalizeActivity({
        variant,
        title,
        description,
        time,
        progress,
        image,
        isPlaying,
        isActive,
        onPlayPause,
        onConfirm,
        onCancel,
        onStop,
        actions,
        icon,
      }),
    [
      actions,
      description,
      icon,
      image,
      isActive,
      isPlaying,
      onCancel,
      onConfirm,
      onPlayPause,
      onStop,
      progress,
      time,
      title,
      variant,
    ],
  );

  const secondary = useMemo(
    () => normalizeActivity(secondaryActivity),
    [secondaryActivity],
  );

  const activeActivity =
    activeSource === "secondary" && secondaryActivity
      ? secondary
      : primaryActivity;

  const requestMode = useCallback(
    (nextMode: DynamicIslandMode) => {
      if (!mode) {
        setInternalMode(nextMode);
      }

      if (nextMode !== currentMode) {
        onModeChange?.(nextMode);
      }
    },
    [currentMode, mode, onModeChange],
  );

  const collapseTransient = useCallback(() => {
    if (currentMode === "transient") {
      requestMode("compact");
    }
  }, [currentMode, requestMode]);

  const toggleMode = useCallback(() => {
    setFeedback(null);
    requestMode(isDetailedMode(currentMode) ? "compact" : "expanded");
  }, [currentMode, requestMode]);

  const confirmWithSuccess = useCallback(() => {
    activeActivity.onConfirm?.();
    setFeedback("success");
    requestMode("transient");
  }, [activeActivity, requestMode]);

  useEffect(() => {
    if (!autoCollapse || currentMode !== "transient") {
      return;
    }

    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
    }

    collapseTimerRef.current = setTimeout(() => {
      setFeedback(null);
      requestMode("compact");
    }, autoCollapseDelay);

    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, [autoCollapse, autoCollapseDelay, currentMode, requestMode]);

  useEffect(() => {
    if (activeActivity.variant !== "progress") {
      progressCompleteRef.current = false;
      return;
    }

    const value = clampProgress(activeActivity.progress);

    if (value < 100) {
      progressCompleteRef.current = false;
      if (feedback === "success") {
        setFeedback(null);
      }
      return;
    }

    if (!progressCompleteRef.current) {
      progressCompleteRef.current = true;
      setFeedback("success");
      requestMode("transient");
    }
  }, [activeActivity, feedback, requestMode]);

  const showSplit = currentMode === "split" && Boolean(secondaryActivity);

  return (
    <div
      data-slot="dynamic-island"
      className={twMerge(styles.root(), className)}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {showSplit ? (
          <motion.div
            key="split"
            layout
            className={styles.splitGroup()}
            transition={islandTransition}
          >
            <IslandSurface
              activity={primaryActivity}
              mode="compact"
              styles={styles}
              scope="dynamic-island-primary"
              feedback={feedback}
              primarySplit
              onToggle={toggleMode}
              onExpandFromSplit={() => {
                setActiveSource("primary");
                setFeedback(null);
                requestMode("expanded");
              }}
              onConfirmSuccess={confirmWithSuccess}
              onTransientBlur={collapseTransient}
            />
            <IslandSurface
              activity={secondary}
              mode="minimal"
              styles={styles}
              scope="dynamic-island-secondary"
              feedback={null}
              secondarySplit
              onToggle={toggleMode}
              onExpandFromSplit={() => {
                setActiveSource("secondary");
                setFeedback(null);
                requestMode("expanded");
              }}
              onConfirmSuccess={confirmWithSuccess}
              onTransientBlur={collapseTransient}
            />
          </motion.div>
        ) : (
          <IslandSurface
            key={`${activeSource}-single`}
            activity={activeActivity}
            mode={currentMode}
            styles={styles}
            scope={`dynamic-island-${activeSource}`}
            feedback={feedback}
            onToggle={toggleMode}
            onConfirmSuccess={confirmWithSuccess}
            onTransientBlur={collapseTransient}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
