"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import {
  attentionPulse,
  spring,
  staggerContainer,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

/** Steps above the page. Matches the conventional "above a dialog" rung. */
const ACHIEVEMENT_TOAST_OFFSET = 3;

/** Default time on screen, in ms. Pass `duration={0}` to keep it until dismissed. */
export const ACHIEVEMENT_TOAST_DURATION = 4000;

export type AchievementToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const positionClasses: Record<AchievementToastPosition, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
};

const isTop = (position: AchievementToastPosition) =>
  position.startsWith("top");

/**
 * The card arrives from off the nearest edge, so a bottom-corner toast rises
 * into place and a top-corner one drops in — the bounce lands against the edge
 * it came from instead of against nothing.
 */
function cardVariantsFor(position: AchievementToastPosition): Variants {
  const travel = isTop(position) ? -12 : 12;
  return {
    hidden: { opacity: 0, y: travel, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      // The one place spring.playful is spent: a toast that only appears when
      // something went right. Chosen by hand, never via motionForOffset.
      transition: spring.playful,
    },
    // Exit runs on the tier's *exit* duration, not its full duration. The
    // unmount guard in useExitAnimation is armed off that same number, so an
    // exit animating for the longer entrance duration would get cut short.
    exit: {
      opacity: 0,
      y: travel * 0.6,
      scale: 0.96,
      transition: { duration: spring.playful.exit.duration },
    },
  };
}

const reducedCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: spring.fast },
  exit: { opacity: 0, transition: { duration: spring.fast.exit.duration } },
};

/**
 * Counts down to a self-dismiss, and returns the handlers that suspend it.
 *
 * Pointer or focus inside the toast stops the clock: a celebration that
 * vanishes out from under the cursor reading it is worse than one that
 * overstays. Leaving restarts the full window rather than resuming the
 * remainder — whatever was just read deserves to be readable again.
 */
function useAutoDismiss(
  active: boolean,
  duration: number,
  onDismiss: () => void,
) {
  const [paused, setPaused] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active || paused || duration <= 0) return;
    const timer = window.setTimeout(() => onDismissRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [active, paused, duration]);

  return {
    onPointerEnter: () => setPaused(true),
    onPointerLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
  } as const;
}

type AchievementToastViewportProps = {
  position: AchievementToastPosition;
  className?: string;
  children: ReactNode;
};

function AchievementToastViewport({
  position,
  className,
  children,
}: AchievementToastViewportProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // document.body only exists after hydration; reading it during render would
  // break SSR.
  useEffect(() => setContainer(document.body), []);

  if (!container) {
    return null;
  }

  return createPortal(
    // The toast is pinned to the viewport, so its substrate is always the page
    // — not whatever card happened to render it. Resetting the surface here
    // keeps offset={3} meaning the same rung from anywhere in the tree, which
    // is the opposite of what a nestable overlay like Stacked Dialog wants.
    <SurfaceProvider value={1}>
      <div
        data-slot="achievement-toast-viewport"
        aria-live="polite"
        className={cn(
          "not-prose pointer-events-none fixed z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2",
          positionClasses[position],
          className,
        )}
      >
        {children}
      </div>
    </SurfaceProvider>,
    container,
  );
}

type AchievementCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** True once the entrance has settled, which is what cues the icon pulse. */
  landed: boolean;
  onDismiss: () => void;
  shouldReduceMotion: boolean;
  className?: string;
};

function AchievementCard({
  title,
  description,
  icon,
  landed,
  onDismiss,
  shouldReduceMotion,
  className,
}: AchievementCardProps) {
  return (
    <Elevated
      offset={ACHIEVEMENT_TOAST_OFFSET}
      data-slot="achievement-toast"
      className={cn(
        // No border: the shadow-surface ring on <Elevated> already draws the
        // edge, and a border on top of it flattens the ladder.
        "flex w-full items-start gap-3 overflow-hidden rounded-2xl p-3 text-foreground",
        className,
      )}
    >
      {icon ? (
        <Elevated
          offset={1}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-primary [&_svg]:size-4"
        >
          <motion.span
            className="flex items-center justify-center"
            variants={shouldReduceMotion ? undefined : attentionPulse}
            // Fires on landing, not on mount, so the pulse reads as the toast
            // settling rather than as a second thing happening at once.
            animate={landed && !shouldReduceMotion ? "pulse" : undefined}
            aria-hidden="true"
          >
            {icon}
          </motion.span>
        </Elevated>
      ) : null}

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-sm font-medium leading-none text-foreground">
          {title}
        </p>
        {description ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <Elevated offset={1} className="shrink-0 rounded-md">
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss ${title}`}
          // Hover tints the surface instead of replacing it, so the control
          // keeps its rung on the ladder.
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X className="size-3" strokeWidth={2} aria-hidden="true" />
        </button>
      </Elevated>
    </Elevated>
  );
}

export type AchievementToastProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  /** ms on screen before it dismisses itself. `0` disables auto-dismiss. */
  duration?: number;
  position?: AchievementToastPosition;
  className?: string;
};

export function AchievementToast({
  open,
  onOpenChange,
  title,
  description,
  icon,
  duration = ACHIEVEMENT_TOAST_DURATION,
  position = "bottom-right",
  className,
}: AchievementToastProps) {
  const shouldReduceMotion = useReducedMotion();
  const { mounted, onAnimationComplete } = useExitAnimation(
    open,
    spring.playful,
  );
  const [landed, setLanded] = useState(false);

  const dismiss = useCallback(() => onOpenChange(false), [onOpenChange]);
  const pauseHandlers = useAutoDismiss(open, duration, dismiss);

  useEffect(() => {
    if (!open) setLanded(false);
  }, [open]);

  const handleAnimationComplete = useCallback(() => {
    if (open) {
      setLanded(true);
      return;
    }
    onAnimationComplete();
  }, [open, onAnimationComplete]);

  if (!mounted) {
    return null;
  }

  const variants = shouldReduceMotion
    ? reducedCardVariants
    : cardVariantsFor(position);

  return (
    <AchievementToastViewport position={position}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={open ? "visible" : "exit"}
        onAnimationComplete={handleAnimationComplete}
        className="pointer-events-auto w-full"
        {...pauseHandlers}
      >
        <AchievementCard
          title={title}
          description={description}
          icon={icon}
          landed={landed}
          onDismiss={dismiss}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className={className}
        />
      </motion.div>
    </AchievementToastViewport>
  );
}

export type AchievementData = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

export type AchievementToastGroupProps = {
  achievements: AchievementData[];
  onDismiss: (id: string) => void;
  /** ms on screen before each item dismisses itself. `0` disables auto-dismiss. */
  duration?: number;
  position?: AchievementToastPosition;
  className?: string;
};

/**
 * Several achievements landing at once — the run of green at the end of a
 * pipeline, not a running feed. Uses `stagger.playful`, the widest gap in the
 * scale, so each one reads as its own arrival instead of as a list appearing.
 *
 * Like Live Queue, the stagger orchestrates whatever is already in the array
 * on mount; items appended later enter individually, without inheriting a
 * queued-up delay.
 */
export function AchievementToastGroup({
  achievements,
  onDismiss,
  duration = ACHIEVEMENT_TOAST_DURATION,
  position = "bottom-right",
  className,
}: AchievementToastGroupProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AchievementToastViewport position={position} className={className}>
      <motion.div
        data-slot="achievement-toast-group"
        variants={shouldReduceMotion ? undefined : staggerContainer("playful")}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        className="flex w-full flex-col gap-2"
      >
        <AnimatePresence mode="popLayout">
          {achievements.map((achievement) => (
            <AchievementToastGroupItem
              key={achievement.id}
              achievement={achievement}
              duration={duration}
              position={position}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </AchievementToastViewport>
  );
}

type AchievementToastGroupItemProps = {
  achievement: AchievementData;
  duration: number;
  position: AchievementToastPosition;
  onDismiss: (id: string) => void;
};

function AchievementToastGroupItem({
  achievement,
  duration,
  position,
  onDismiss,
}: AchievementToastGroupItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const [landed, setLanded] = useState(false);

  const dismiss = useCallback(
    () => onDismiss(achievement.id),
    [onDismiss, achievement.id],
  );
  const pauseHandlers = useAutoDismiss(true, duration, dismiss);

  return (
    <motion.div
      layout={!shouldReduceMotion}
      variants={
        shouldReduceMotion ? reducedCardVariants : cardVariantsFor(position)
      }
      exit="exit"
      onAnimationComplete={() => setLanded(true)}
      className="pointer-events-auto w-full"
      {...pauseHandlers}
    >
      <AchievementCard
        title={achievement.title}
        description={achievement.description}
        icon={achievement.icon}
        landed={landed}
        onDismiss={dismiss}
        shouldReduceMotion={Boolean(shouldReduceMotion)}
      />
    </motion.div>
  );
}
